const lzEndpointABI = [
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "_userApplication",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "_payload",
                "type": "bytes"
            },
            {
                "internalType": "bool",
                "name": "_payInZRO",
                "type": "bool"
            },
            {
                "internalType": "bytes",
                "name": "_adapterParams",
                "type": "bytes"
            }
        ],
        "name": "estimateFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "nativeFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "zroFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "bytes",
                "name": "_destination",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "_payload",
                "type": "bytes"
            },
            {
                "internalType": "address payable",
                "name": "_refundAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_zroPaymentAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "_adapterParams",
                "type": "bytes"
            }
        ],
        "name": "send",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

const bridgeABI = [
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "_receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "bridge",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "_receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "estimateFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

module.exports = {
    contracts: {
        base: {
            bridge: "0x6EDCE65403992e310A62460808c4b910D972f10f",
            chainId: 84532, // Base T
            lzChainId: 184 // LayerZero Chain ID for Base
        },
        flowEvm: {
            bridge: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
            chainId: 545,
            lzChainId: 1,
        },
        bsc: {
            bridge: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1",
            chainId: 97, // BSC T
            lzChainId: 102 // LayerZero Chain ID for BSC
        },
        endpoints: {
            base: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",    // Base testnet
            flowEvm: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab", // Flow testnet
            bsc: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1"      // BSC testnet
        }
    },
    bridgeABI,
    lzEndpointABI
};

