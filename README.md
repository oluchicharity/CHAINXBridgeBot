# CHAINXBridgeBot
CHAINXBridgeBot - Telegram Wallet Management Bot
CHAINXBridgeBot is a Telegram bot designed to allow users to interact with their cryptocurrency wallets across multiple blockchain networks, such as Sepolia, BSC, and Flow EVM. The bot enables users to securely export their private keys and wallet details directly through Telegram, providing a seamless experience for wallet management.

Table of Contents
Inspiration
What it does
How we built it
Technologies Used
Setting Up Locally
Environment Variables
Usage
Contributing
License
Inspiration
The inspiration for creating the CHAINXBridgeBot was the need for an easy-to-use, secure Telegram bot that allows users to manage their cryptocurrency wallets without needing to access multiple platforms. By combining simplicity with security, we wanted to provide a convenient solution for managing wallets and private keys directly from within Telegram.

What it does
CHAINXBridgeBot offers the following key functionalities:

Generate & Export Wallet: Users can generate wallets and export wallet details.
Export Private Key: Securely export and retrieve a private key.
Interact with Multiple Blockchain Networks: Connect with Sepolia, Binance Smart Chain, and Flow EVM.
Encrypted Data Storage: User wallet information is securely encrypted before storing it.
How we built it
This bot was built using the following technologies:

Node.js: Used as the backend JavaScript runtime.
Telegraf.js: A framework for building Telegram bots with Node.js.
Supabase: For database and secure wallet storage.
Blockchain RPCs: For interacting with blockchains such as Base-sepolia-testnet, BSC-testnet, and Flow-evm-testnet.
Custom Encryption Logic: For securely handling private keys and other sensitive data.
Technologies Used
Node.js - JavaScript runtime for building the bot.
Telegraf.js - Telegram bot API framework for Node.js.
Supabase - For database and user management.
Blockchain RPCs - Connects with multiple blockchain networks.
Encryption - Securely stores sensitive user data like private keys.
LayerZero Provider

Setting Up Locally
Prerequisites
Node.js installed on your machine. Download from Node.js.
Git for version control. Install from Git.
Supabase: Create an account and set up a project on Supabase.
Telegram Bot: Set up a Telegram Bot using BotFather and get your BOT_TOKEN.
Steps to Get Started
Clone the Repository: Clone the repository to your local machine:

bash
Copy
Edit
git clone https://github.com/oluchicharity/CHAINXBridgeBot.git
Navigate to the Project Directory:

bash
Copy
Edit
cd CHAINXBridgeBot
Install Dependencies: Install the necessary dependencies:

bash
Copy
Edit
npm install
Create a .env File: Copy the example .env.example file to .env and fill in your environment variables:

bash
Copy
Edit
cp .env.example .env
Set Up Environment Variables: Update the .env file with the necessary keys:

env
Copy
Edit
BOT_TOKEN=your_telegram_bot_token
BASE_RPC_URL=your_base_rpc_url
FLOW_EVM_RPC_URL=your_flow_evm_rpc_url
BSC_RPC_URL=your_bsc_rpc_url
SC_RPC_URL=your_sc_rpc_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
ENCRYPTION_SECRET=your_encryption_secret
Run the Bot: After setting up your .env file, start the bot:

bash
Copy
Edit
node bot.js
Test the Bot: Open Telegram and search for your bot using its @ChainXBridgeBot. Start interacting with the bot to test its functionality.

Environment Variables
Make sure to set the following environment variables in your .env file:

BOT_TOKEN: Your Telegram bot token from BotFather.
BASE_RPC_URL: RPC URL for interacting with Sepolia testnet.
FLOW_EVM_RPC_URL: RPC URL for the Flow EVM testnet.
BSC_RPC_URL: RPC URL for Binance Smart Chain.
SC_RPC_URL: RPC URL for Binance Smart Chain (mainnet).
SUPABASE_URL: Your Supabase project URL.
SUPABASE_KEY: Supabase API key for accessing your database.
ENCRYPTION_SECRET: A secret key used to encrypt and decrypt private keys.
Example .env:
env
Copy
Edit
BOT_TOKEN=your_telegram_bot_token
BASE_RPC_URL=https://sepolia.base.org
FLOW_EVM_RPC_URL=https://testnet.evm.nodes.onflow.org
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
SC_RPC_URL=https://bsc-dataseed.binance.org
SUPABASE_URL=https://your-supabase-instance-url
SUPABASE_KEY=your_supabase_key
ENCRYPTION_SECRET=your_encryption_secret
Usage
Once the bot is set up and running, you can start interacting with it directly on Telegram. Here are some actions that the bot supports:

Example Commands:
/start - Begin interacting with the bot.
/export - Export wallet details.
/bridge- Bridging Tokens
Contributing
We welcome contributions to improve CHAINXBridgeBot! If you find any bugs or want to add new features, feel free to:

Fork the repository.
Clone your fork to your local machine.
Create a new branch for your changes.
Make your changes and commit them.
Push your changes to your fork.
Open a pull request to merge your changes into the main repository.
License
This project is licensed under the MIT License - see the LICENSE file for details.

