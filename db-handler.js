require("dotenv").config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { Wallet } = require('ethers'); // Required for wallet creation if needed

class DatabaseHandler {
    constructor() {
        // Initialize Supabase client using your environment variables
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );
    }

    // Encrypt the private key using AES-256-CBC before storing it
    async encryptPrivateKey(privateKey) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return `${iv.toString('hex')}:${encrypted}`;
    }

    // Decrypt the stored encrypted private key when needed
    async decryptPrivateKey(encryptedData) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
        
        const [ivHex, encryptedHex] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    // Create a user in the database
    // If a user with the given telegram_id already exists, return that user;
    // otherwise, insert a new record.
    async createUser(telegramId, walletAddress, encryptedKey, mnemonicPhrase) {
        try {
            // Check if user already exists
            const { data: existingUser, error: findError } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId);
            
            if (findError) {
                console.error('Error checking if user exists:', findError);
                return null;
            }

            if (existingUser && existingUser.length > 0) {
                console.log('User already exists.');
                return existingUser[0];
            } else {
                // Insert new user and return the inserted row
                const { data, error: insertError } = await this.supabase
                    .from('users')
                    .insert([
                        {
                            telegram_id: telegramId,
                            wallet_address: walletAddress,
                            encrypted_key: encryptedKey,
                            mnemonic_phrase: mnemonicPhrase,
                            created_at: new Date().toISOString(),
                        },
                    ], { returning: 'representation' });
        
                if (insertError) {
                    console.error('Error inserting user:', insertError);
                    return null;
                } else {
                    console.log('User created:', data);
                    return data && data.length > 0 ? data[0] : null;
                }
            }
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    // Create a transaction record in the database
    async createTransaction(userId, details) {
        try {
            const { data, error } = await this.supabase
                .from('transactions')
                .insert([{
                    user_id: userId,
                    source_chain: details.sourceChain,
                    destination_chain: details.destChain,
                    amount: details.amount,
                    status: 'pending',
                    tx_hash: details.txHash,
                    created_at: new Date().toISOString()
                }], { returning: 'representation' });
    
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    }

    // Update the transaction status in the database
    async updateTransactionStatus(txHash, status, completionDetails = null) {
        try {
            const { data, error } = await this.supabase
                .from('transactions')
                .update({ 
                    status,
                    completed_at: status === 'completed' ? new Date().toISOString() : null,
                    completion_tx_hash: completionDetails?.txHash,
                    error_message: completionDetails?.error
                })
                .eq('tx_hash', txHash);
    
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    }

    // Get user data from the database by their Telegram ID
    async getUser(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', userId)
                .maybeSingle(); // Returns a single row or null if not found
    
            if (error) throw error;
            if (!data) {
                console.warn(`No user found for telegram_id: ${userId}`);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    // Get the user's bridge context from the database (if applicable)
    async getBridgeContext(userId) {
        const { data, error } = await this.supabase
            .from('bridge_context')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(); // Returns context or null if not found
        
        if (error) {
            console.error('Error fetching bridge context:', error);
            return null;
        }
        return data;
    }
}

// For testing purposes, you can uncomment the following block to create a test user:
// (async () => {
//     const dbHandler = new DatabaseHandler();
//     // Create a random wallet
//     const wallet = Wallet.createRandom();
//     // Encrypt the wallet's private key
//     const encryptedKey = await dbHandler.encryptPrivateKey(wallet.privateKey);
//     const mnemonicPhrase = wallet.mnemonic.phrase;
//     const telegramId = '7743962336';  // Example Telegram ID
//     
//     const user = await dbHandler.createUser(telegramId, wallet.address, encryptedKey, mnemonicPhrase);
//     console.log('User created or updated:', user);
// })();

module.exports = DatabaseHandler;
