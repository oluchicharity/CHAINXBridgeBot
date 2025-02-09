require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios");

class LayerZeroHandler {
    constructor() {
        this.providers = {
            base: new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL),
            flowEvm: new ethers.providers.JsonRpcProvider(process.env.FLOW_EVM_RPC_URL),
            bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC_URL)
        };

        this.lzApi = {
            baseUrl: 'https://api.layerzero.network', // Update if incorrect
            version: 'v1',
            key: process.env.LAYERZERO_API_KEY
        };

        this.chainIds = {
            base: 8453, // LayerZero chain ID for Base
            flowEvm: 99999, // Replace with actual FlowEVM chain ID
            bsc: 56 // Binance Smart Chain
        };
    }

      // Method to set the signer (using private key or wallet)
      setSigner(privateKey) {
        // Initialize the signer using the private key
        this.signer = new ethers.Wallet(privateKey, this.providers.base); // You can change the provider to match the network
    }


    async estimateBridgeFee(sourceChain, destChain, amount) {
        try {
            const response = await axios.get(
                `${this.lzApi.baseUrl}/${this.lzApi.version}/estimate-fee`,
                {
                    params: {
                        sourceChain: this.chainIds[sourceChain],
                        destChain: this.chainIds[destChain],
                        amount: ethers.utils.parseEther(amount.toString()).toString(),
                        type: "send"
                    },
                    headers: {
                        Authorization: `Bearer ${this.lzApi.key}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log(`Estimated fee for bridging from ${sourceChain} to ${destChain}:`, response.data.fee);
            return response.data.fee;
        } catch (error) {
            console.error("Error estimating bridge fee:", error.response?.data || error.message);
            throw new Error("Failed to estimate bridge fee");
        }
    }

    async executeBridge(userWallet, sourceChain, destChain, amount) {
        try {
            const fee = await this.estimateBridgeFee(sourceChain, destChain, amount);

            // Prepare the bridge transaction details
            const bridgeRequest = {
                sourceChain: this.chainIds[sourceChain],
                destChain: this.chainIds[destChain],
                amount: ethers.utils.parseEther(amount.toString()).toString(),
                sender: userWallet.address,
                receiver: userWallet.address,
                fee
            };

            // Sign the transaction using the wallet signer
            const signedTransaction = await this.signer.signTransaction(bridgeRequest);

            // Send the signed transaction to LayerZero's bridge endpoint
            const response = await axios.post(
                `${this.lzApi.baseUrl}/${this.lzApi.version}/bridge`,
                { ...bridgeRequest, signedTransaction },
                {
                    headers: {
                        Authorization: `Bearer ${this.lzApi.key}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log(`Bridge transaction sent from ${sourceChain} to ${destChain}:`, response.data.transactionHash);

            return {
                txHash: response.data.transactionHash,
                status: response.data.status,
                fee: ethers.utils.formatEther(fee)
            };
        } catch (error) {
            console.error("Error executing bridge:", error.response?.data || error.message);
            throw new Error("Bridge transaction failed");
        }
    }

    async getBridgeStatus(txHash) {
        try {
            const response = await axios.get(
                `${this.lzApi.baseUrl}/${this.lzApi.version}/transaction/${txHash}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.lzApi.key}`
                    }
                }
            );

            console.log("Bridge transaction status:", response.data);

            return {
                status: response.data.status,
                sourceChain: response.data.sourceChain,
                destChain: response.data.destChain,
                amount: response.data.amount,
                completedAt: response.data.completedAt
            };
        } catch (error) {
            console.error("Error getting bridge status:", error.response?.data || error.message);
            throw new Error("Failed to get bridge status");
        }
    }

    async monitorBridgeTransaction(txHash, callback) {
        const checkStatus = async () => {
            try {
                const status = await this.getBridgeStatus(txHash);

                if (status.status === "completed") {
                    callback(null, status);
                    return;
                } else if (status.status === "failed") {
                    callback(new Error("Bridge transaction failed"), status);
                    return;
                }

                setTimeout(checkStatus, 30000);
            } catch (error) {
                callback(error);
            }
        };

        checkStatus();
    }

    async getBalance(address, chain) {
        try {
            const provider = this.providers[chain];
            if (!provider) {
                throw new Error(`Provider for ${chain} is not set up`);
            }
            console.log(`Fetching balance for address: ${address} on ${chain}...`);
            const balance = await provider.getBalance(address);
            console.log(`Balance for ${address} on ${chain}: ${balance}`);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error(`Error getting balance for ${chain}:`, error);
            throw error;
        }
    }
    
}

module.exports = LayerZeroHandler;
