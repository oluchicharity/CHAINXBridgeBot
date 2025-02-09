require("dotenv").config();
const LayerZeroHandler = require('./layerZero');

async function testBridge() {
    try {
        // User wallet information
        const userWallet = {
            address: "0x920feE74879D909Db9f73191D8fa5Ae1f1388aFe" // Replace with the actual wallet address
        };

        const privateKey = process.env.USER_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("Private key is undefined or missing in .env file.");
        }

        const layerZero = new LayerZeroHandler();
        layerZero.setSigner(privateKey);

        // Example: Bridge 0.1 ETH from Base to FlowEVM
        const result = await layerZero.executeBridge(userWallet, "base", "flowEvm", 0.1);
        console.log("Bridge Result:", result);

        // Monitor the transaction
        layerZero.monitorBridgeTransaction(result.txHash, (error, status) => {
            if (error) {
                console.error("Bridge transaction failed:", error);
            } else {
                console.log("Bridge completed successfully:", status);
            }
        });
    } catch (error) {
        console.error("Bridge test failed:", error);
    }
}

testBridge();
