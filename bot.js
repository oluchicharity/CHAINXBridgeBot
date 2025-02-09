require("dotenv").config();
const { Bot, InlineKeyboard } = require("grammy");
const { ethers } = require("ethers");
const LayerZeroHandler = require('./layerZero');
const BridgeHandler = require('./bridge-handler');
const DatabaseHandler = require('./db-handler');

class ChainXBridgeBot {
  constructor() {
    try {
      // Print RPC URLs for debugging
      console.log('RPC URLs:', {
        base: process.env.BASE_RPC_URL,
        flowEvm: process.env.FLOW_EVM_RPC_URL,
        bsc: process.env.BSC_RPC_URL
      });

      // Initialize providers (using only LayerZero)
      this.providers = {
        base: new ethers.providers.JsonRpcProvider(
          process.env.BASE_RPC_URL,
          { name: "base-sepolia", chainId: 84532 }
        ),
        flowEvm: new ethers.providers.JsonRpcProvider(
          process.env.FLOW_EVM_RPC_URL,
          { name: "flow-evm-testnet", chainId: 545 }
        ),
        bsc: new ethers.providers.JsonRpcProvider(
          process.env.BSC_RPC_URL,
          { name: "bsc-testnet", chainId: 97 }
        )
      };

      console.log('Providers initialized:', Object.keys(this.providers));

      // Log detected networks
      (async () => {
        for (const [chain, provider] of Object.entries(this.providers)) {
          try {
            const network = await provider.getNetwork();
            console.log(`Network for ${chain}:`, network);
          } catch (err) {
            console.error(`Error detecting network for ${chain}:`, err);
          }
        }
      })();

      // Initialize database and handlers
      this.db = new DatabaseHandler();
      this.bridgeHandler = new BridgeHandler(this.providers, this.db);
      this.layerZeroHandler = new LayerZeroHandler();

      // Initialize the bot
      this.bot = new Bot(process.env.BOT_TOKEN);
      this.setupHandlers();

      // Global error handler
      this.bot.catch((err) => {
        console.error("Bot error:", err);
      });

    } catch (error) {
      console.error('Error during initialization:', error);
      throw error;
    }
  }

  setupHandlers() {
    // /start command to create or retrieve a wallet
    this.bot.command("start", this.handleStart.bind(this));
    // /export command to show export options
    this.bot.command("export", this.handleExport.bind(this));

    // Listen for text messages
    this.bot.on("message:text", this.handleTextMessage.bind(this));

    // Handle general callback queries (wallet, balance, etc.)
    this.bot.on("callback_query", this.handleCallbackQuery.bind(this));
    // Handle export-specific callback queries (data starting with "export_")
    this.bot.callbackQuery(/^export_(.+)$/, this.handleExportCallback.bind(this));
  }

  async handleStart(ctx) {
    const userId = ctx.from.id;
    let user = await this.db.getUser(userId);

    if (!user) {
      const wallet = ethers.Wallet.createRandom();
      console.log("Private Key:", wallet.privateKey);
      const privateKey = wallet.privateKey;
      const shortPrivateKey = privateKey.slice(0, 6) + "..." + privateKey.slice(-6);
      console.log("Private Key (Short):", shortPrivateKey);

      // Encrypt the private key before storing it
      const encryptedKey = await this.bridgeHandler.encryptPrivateKey(wallet.privateKey, userId);
      const mnemonicPhrase = wallet.mnemonic.phrase;

      user = await this.db.createUser(userId, wallet.address, encryptedKey, mnemonicPhrase);
      console.log("User created or updated:", user);

      const welcomeMessage = `Welcome to ChainX Bridge Bot! 🌉

Your new wallet has been created:
\`${wallet.address}\`

⚠️ Please save your recovery phrase securely:
\`${mnemonicPhrase}\`

Never share this with anyone!`;

      await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
    } else {
      await ctx.reply(`Welcome back, ${ctx.from.first_name}! What would you like to do today?`, {
        parse_mode: "Markdown",
        reply_markup: this.createMainMenu()
      });
    }
  }

  async handleExport(ctx) {
    console.log("Export command triggered");
    const userId = ctx.from.id;
    let user = await this.db.getUser(userId);

    if (user) {
      console.log("User data fetched:", user);
    } else {
      console.log(`No user found for ID: ${userId}`);
    }

    // Show export options
    await this.showExportOptions(ctx);
  }

  async showExportOptions(ctx) {
    const message = "Here is your active wallet's private key.\n" +
      "Ensure to never share your private key(s) with anyone. " +
      "Anyone who has access to it will gain full control of your wallet(s).";
    const exportMenu = new InlineKeyboard()
      .text("🔑 Export Private Key", "export_private_key")
      .row()
      .text("↩️ Back to Main Menu", "export_main_menu");

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        parse_mode: "Markdown",
        reply_markup: exportMenu
      });
    } else {
      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: exportMenu
      });
    }
  }

  async handleCallbackQuery(ctx) {
    console.log("Callback Query Received:", ctx.callbackQuery.data);
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    await ctx.answerCallbackQuery();

    // If the callback data is "export_options", show the export options.
    if (data === "export_options") {
      await this.showExportOptions(ctx);
      return;
    }

    // Handle other callbacks (wallet, balance, etc.)
    if (data === "wallet") {
      const user = await this.db.getUser(userId);
      if (user) {
        await ctx.editMessageText(`Your wallet address is: \`${user.wallet_address}\``, {
          parse_mode: "Markdown",
          reply_markup: this.createMainMenu()
        });
      } else {
        await ctx.editMessageText("Wallet not found. Please send /start to create your wallet.", {
          reply_markup: this.createMainMenu()
        });
      }
    } else if (data === "balance") {
      const user = await this.db.getUser(userId);
      if (user) {
        try {
          console.log(`Fetching balance for address: ${user.wallet_address}`);
          const baseBalance = await this.layerZeroHandler.getBalance(user.wallet_address, 'base');
          const flowBalance = await this.layerZeroHandler.getBalance(user.wallet_address, 'flowEvm');
          const bscBalance = await this.layerZeroHandler.getBalance(user.wallet_address, 'bsc');

          console.log(`Balances fetched: Base: ${baseBalance}, Flow EVM: ${flowBalance}, BSC: ${bscBalance}`);
          const balanceMessage = `Your Balances:
    Base: ${baseBalance} ETH
    Flow EVM: ${flowBalance} ETH
    BSC: ${bscBalance} ETH`;

          await ctx.editMessageText(balanceMessage, { reply_markup: this.createMainMenu() });
        } catch (err) {
          console.error("Error fetching balance:", err);
          await ctx.editMessageText("Error fetching balance. Please try again later.", { reply_markup: this.createMainMenu() });
        }
      } else {
        await ctx.editMessageText("Wallet not found. Please send /start to create your wallet.", { reply_markup: this.createMainMenu() });
      }
    } else {
      // For any other callbacks, return to main menu
      await ctx.editMessageText("What would you like to do?", { reply_markup: this.createMainMenu() });
    }
  }

  // Handles export-specific callback queries (data starting with "export_")
  async handleExportCallback(ctx) {
    // Extract the export action; expected values: "private_key" or "main_menu"
    const action = ctx.match[1];
    const userId = ctx.from.id;
  
    console.log(`Export Callback Received: ${action}`);
  
    try {
      const user = await this.db.getUser(userId);
      if (!user) {
        console.log(`No user found for ID: ${userId}`);
        await ctx.answerCallbackQuery("Wallet not found. Please create a wallet first.", { show_alert: true });
        return;
      }
      console.log("User data for export:", user);
  
      switch (action) {
        case "private_key": {
          // Decrypt the private key only when requested
          const decryptedKey = await this.db.decryptPrivateKey(user.encrypted_key);
          console.log(`Decrypted Private Key: ${decryptedKey}`);
          const privateKeyMessage = `🔐 *Your Private Key*\n\`${decryptedKey}\`\n\n⚠️ Keep this private key secure and never share it with anyone!`;
          // Send the private key as a new message (do not modify the export options message)
          await ctx.reply(privateKeyMessage, { parse_mode: "Markdown" });
          await ctx.answerCallbackQuery("Private key has been sent.");
          break;
        }
        case "main_menu": {
          console.log("Returning to main menu.");
          await ctx.editMessageText("What would you like to do?", { reply_markup: this.createMainMenu() });
          await ctx.answerCallbackQuery();
          break;
        }
        default: {
          console.log(`Unknown export action: ${action}`);
          await ctx.answerCallbackQuery("Unknown export action.", { show_alert: true });
          break;
        }
      }
    } catch (error) {
      console.error("Error handling export callback:", error);
      await ctx.answerCallbackQuery("An error occurred while processing your request.", { show_alert: true });
    }
  }
  

  createMainMenu() {
    return new InlineKeyboard()
      .text("🌉 Bridge Tokens", "bridge")
      .row()
      .text("💼 Wallet", "wallet")
      .text("Balance", "balance")
      .row()
      .text("📤 Export Wallet", "export_options");
  }

  async handleTextMessage(ctx) {
    const amount = parseFloat(ctx.message.text);
    const userId = ctx.from.id;
    const bridgeContext = await this.db.getBridgeContext(userId);

    if (bridgeContext && !isNaN(amount)) {
      const fee = await this.layerZeroHandler.estimateBridgeFee(
        bridgeContext.sourceChain, 
        bridgeContext.destChain, 
        amount
      );
      await ctx.reply(`Estimated fee: ${ethers.utils.formatEther(fee)} ETH`, {
        reply_markup: new InlineKeyboard()
          .text("Confirm", `confirm_bridge_${amount}`)
          .text("Cancel", "main_menu")
      });
    }
  }

  start() {
    this.bot.start();
  }
}

const bot = new ChainXBridgeBot();
bot.start();
