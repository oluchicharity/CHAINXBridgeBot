require("dotenv").config();
const { ethers } = require("ethers");
const { contracts, bridgeABI, lzEndpointABI } = require("./bridge-config");
const crypto = require("crypto");

class BridgeHandler {
    constructor(providers, dbHandler) {
        console.log("BridgeHandler constructor - Providers:", Object.keys(providers));
        console.log("Contracts config:", contracts);

        this.providers = providers;
        this.db = dbHandler;
        this.contracts = this.initializeContracts();
        this.lzEndpoints = this.initializeLZEndpoints();
    }


    initializeContracts() {
        return Object.fromEntries(
            Object.entries(contracts)
                .filter(([chain]) => chain !== "endpoints")
                .map(([chain, config]) => {
                    console.log(`Initializing contract for ${chain}:`, {
                        address: config.bridge,
                        hasProvider: !!this.providers[chain],
                    });

                    if (!config.bridge) {
                        throw new Error(`Missing bridge address for chain: ${chain}`);
                    }
                    if (!this.providers[chain]) {
                        throw new Error(`Missing provider for chain: ${chain}`);
                    }

                    return [
                        chain,
                        new ethers.Contract(config.bridge, bridgeABI, this.providers[chain]),
                    ];
                })
        );
    }

    initializeLZEndpoints() {
        return Object.fromEntries(
            Object.entries(contracts.endpoints).map(([chain, address]) => [
                chain,
                new ethers.Contract(address, lzEndpointABI, this.providers[chain])
            ])
        );
    }

    encryptPrivateKey(privateKey, userId) {
        const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encrypted = cipher.update(privateKey, "utf8", "hex") + cipher.final("hex");
        return iv.toString('hex') + ':' + encrypted;
    }

    decryptPrivateKey(encryptedData, userId) {
        const [ivHex, encryptedKey] = encryptedData.split(':');
        const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        const decryptedPrivateKey = decipher.update(encryptedKey, "hex", "utf8") + decipher.final("utf8");
    
        // Log the decrypted private key
        console.log('Decrypted private key:', decryptedPrivateKey);
        
        return decryptedPrivateKey;
    }
    

    async estimateBridgeFees(sourceChain, destChain, receiver, amount) {
        const endpoint = this.lzEndpoints[sourceChain];
        const sourceContract = this.contracts[sourceChain];
        const destChainId = contracts[destChain].lzChainId;
        const amountWei = ethers.utils.parseEther(amount.toString());

        // Encode the payload that will be sent across chains
        const payload = ethers.utils.defaultAbiCoder.encode(
            ['address', 'uint256'],
            [receiver, amountWei]
        );

        // Standard adapter parameters (version = 1)
        const adapterParams = ethers.utils.solidityPack(
            ['uint16', 'uint256'],
            [1, 200000] // Version 1, gas limit 200k
        );

        try {
            const [nativeFee, zroFee] = await endpoint.estimateFees(
                destChainId,
                sourceContract.address,
                payload,
                false, // payInZRO = false
                adapterParams
            );

            return nativeFee;
        } catch (error) {
            console.error('Error estimating fees:', error);
            throw error;
        }
    }

    async executeBridge(userId, sourceChain, destChain, amount) {
        try {
            console.log(`Initiating bridge from ${sourceChain} to ${destChain} for amount: ${amount}`);
            
            const user = await this.db.getUser(userId);
            console.log('User retrieved:', { address: user.wallet_address });
            
            const wallet = new ethers.Wallet(
                this.decryptPrivateKey(user.encrypted_key, userId), 
                this.providers[sourceChain]
            );
            
            const sourceContract = this.contracts[sourceChain].connect(wallet);
            const destChainId = contracts[destChain].lzChainId;
            const amountWei = ethers.utils.parseEther(amount.toString());

            // Estimate LayerZero fees
            const lzFee = await this.estimateBridgeFees(
                sourceChain,
                destChain,
                user.wallet_address,
                amount
            );
            
            console.log('Bridge parameters:', {
                sourceChain,
                destChain,
                destChainId,
                amount: amount.toString(),
                amountWei: amountWei.toString(),
                lzFee: ethers.utils.formatEther(lzFee)
            });

            const tx = await sourceContract.bridge(
                destChainId,
                user.wallet_address,
                amountWei,
                {
                    value: lzFee,
                    gasLimit: 500000 // Fixed gas limit for predictability
                }
            );
            
            console.log('Transaction sent:', tx.hash);
            
            await this.db.createTransaction(userId, {
                sourceChain,
                destChain,
                amount: amount.toString(),
                txHash: tx.hash,
                status: 'pending',
                lzFee: ethers.utils.formatEther(lzFee)
            });

            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            return {
                txHash: tx.hash,
                lzFee: ethers.utils.formatEther(lzFee)
            };
        } catch (error) {
            console.error('Bridge execution error:', error);
            throw new Error(`Failed to execute bridge: ${error.message}`);
        }
    }
}

module.exports = BridgeHandler;