// services/stellar.ts
import { default as StellarSDK } from 'stellar-sdk';

// Configuration for MAINNET
const HORIZON_URL = 'https://horizon.stellar.org';
const NETWORK_PASSPHRASE = StellarSDK.Networks.PUBLIC;

/**
 * StellarService provides methods to interact with the Stellar network (MAINNET)
 */
export class StellarService {
  private server: any;

  constructor() {
    this.server = new StellarSDK.Server(HORIZON_URL);
  }

  /**
   * Generate a new Stellar account keypair
   * @returns {Object} The public key and secret key
   */
  generateKeypair() {
    const keypair = StellarSDK.Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Get account details from the Stellar network
   * @param {string} publicKey - The account's public key
   * @returns {Promise<Object>} Account details
   */
  async getAccount(publicKey: string) {
    try {
      const account = await this.server.loadAccount(publicKey);
      return {
        success: true,
        account
      };
    } catch (error: unknown) {
      console.error('Error loading account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a payment request with QR code data
   * @param {string} destinationAddress - Destination Stellar address
   * @param {string} amount - Payment amount
   * @param {string} assetCode - Asset code (XLM, USDC, etc.)
   * @param {string} assetIssuer - Asset issuer for non-native assets
   * @param {string} memo - Optional memo for the payment
   * @returns {Object} Payment request details
   */
  createPaymentRequest(
    destinationAddress: string, 
    amount: string, 
    assetCode: string, 
    assetIssuer: string | null = null,
    memo: string = ''
  ) {
    try {
      // Create payment URL compatible with Stellar wallets
      let paymentUrl = `web+stellar:pay?destination=${destinationAddress}&amount=${amount}`;
      
      // Add asset details if not XLM
      if (assetCode !== 'XLM' && assetIssuer) {
        paymentUrl += `&asset_code=${assetCode}&asset_issuer=${assetIssuer}`;
      }
      
      // Add memo if provided
      if (memo) {
        paymentUrl += `&memo=${encodeURIComponent(memo)}`;
      }
      
      const paymentId = 'pay_' + Date.now().toString(36);
      
      return {
        success: true,
        paymentId,
        paymentUrl,
        destinationAddress,
        amount,
        assetCode,
        assetIssuer,
        memo,
        timestamp: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error('Error creating payment request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send a payment on the Stellar network
   * @param {string} sourceSecret - Secret key of the source account
   * @param {string} destinationAddress - Destination Stellar address
   * @param {string} amount - Amount to send
   * @param {string} assetCode - Asset code (XLM, USDC, etc.)
   * @param {string} assetIssuer - Asset issuer (null for XLM)
   * @param {string} memo - Optional memo for the payment
   * @returns {Promise<Object>} Transaction result
   */
  async sendPayment(
    sourceSecret: string,
    destinationAddress: string,
    amount: string,
    assetCode: string = 'XLM',
    assetIssuer: string | null = null,
    memo: string = ''
  ) {
    try {
      const sourceKeypair = StellarSDK.Keypair.fromSecret(sourceSecret);
      const sourcePublicKey = sourceKeypair.publicKey();
      
      // Load the source account
      const sourceAccount = await this.server.loadAccount(sourcePublicKey);
      
      // Determine which asset to send (XLM or other)
      let asset;
      if (assetCode === 'XLM') {
        asset = StellarSDK.Asset.native();
      } else if (assetIssuer) {
        asset = new StellarSDK.Asset(assetCode, assetIssuer);
      } else {
        throw new Error('Asset issuer is required for non-native assets');
      }
      
      // Build the transaction
      const transaction = new StellarSDK.TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE  // Using PUBLIC network passphrase
      })
        .addOperation(StellarSDK.Operation.payment({
          destination: destinationAddress,
          asset: asset,
          amount: amount
        }))
        .setTimeout(30)
        .build();
      
      // Sign the transaction
      transaction.sign(sourceKeypair);
      
      // Submit to the network
      const transactionResult = await this.server.submitTransaction(transaction);
      
      return {
        success: true,
        transactionId: transactionResult.id,
        ledger: transactionResult.ledger,
        hash: transactionResult.hash
      };
    } catch (error: unknown) {
      console.error('Error sending payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get payment transactions for an account
   * @param {string} publicKey - The account's public key
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Object>} Transaction history
   */
  async getPaymentHistory(publicKey: string, limit: number = 10) {
    try {
      const payments = await this.server.payments()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();
      
      return {
        success: true,
        payments: payments.records
      };
    } catch (error: unknown) {
      console.error('Error getting payment history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if account exists 
   * @param {string} publicKey - The account's public key
   * @returns {Promise<Object>} Account status
   */
  async checkAccountExists(publicKey: string) {
    try {
      // Check if account exists
      try {
        await this.server.loadAccount(publicKey);
        return {
          success: true,
          exists: true,
          message: 'Account exists on mainnet'
        };
      } catch (e) {
        return {
          success: true,
          exists: false,
          message: 'Account does not exist on mainnet - needs funding'
        };
      }
    } catch (error: unknown) {
      console.error('Error checking account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get available balance for an asset
   * @param {string} publicKey - The account's public key
   * @param {string} assetCode - Asset code to check
   * @param {string} assetIssuer - Asset issuer (null for XLM)
   * @returns {Promise<Object>} Balance information
   */
  async getAssetBalance(
    publicKey: string, 
    assetCode: string = 'XLM', 
    assetIssuer: string | null = null
  ) {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      // Find the balance for the specified asset
      let balance = '0';
      
      if (assetCode === 'XLM') {
        // Find native XLM balance
        const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
        balance = xlmBalance ? xlmBalance.balance : '0';
      } else if (assetIssuer) {
        // Find non-native asset balance
        const assetBalance = account.balances.find((b: any) => 
          b.asset_code === assetCode && 
          b.asset_issuer === assetIssuer
        );
        balance = assetBalance ? assetBalance.balance : '0';
      } else {
        // Find any asset with the specified code
        const assetBalances = account.balances.filter((b: any) => 
          b.asset_code === assetCode
        );
        
        if (assetBalances.length > 0) {
          return {
            success: true,
            balances: assetBalances
          };
        } else {
          balance = '0';
        }
      }
      
      return {
        success: true,
        balance
      };
    } catch (error: unknown) {
      console.error('Error getting asset balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get list of trustlines for an account
   * @param {string} publicKey - The account's public key
   * @returns {Promise<Object>} Trustlines information
   */
  async getTrustlines(publicKey: string) {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      // Filter out the native balance (XLM) to get only trustlines
      const trustlines = account.balances.filter((b: any) => b.asset_type !== 'native');
      
      return {
        success: true,
        trustlines
      };
    } catch (error: unknown) {
      console.error('Error getting trustlines:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Setup a trustline for a new asset
   * @param {string} secretKey - Secret key of the account
   * @param {string} assetCode - Asset code to trust
   * @param {string} assetIssuer - Asset issuer address
   * @param {string} limit - Trust limit (optional)
   * @returns {Promise<Object>} Transaction result
   */
  async addTrustline(
    secretKey: string,
    assetCode: string,
    assetIssuer: string,
    limit: string = '1000000000' // Default high limit
  ) {
    try {
      const keypair = StellarSDK.Keypair.fromSecret(secretKey);
      const publicKey = keypair.publicKey();
      
      // Load the account
      const account = await this.server.loadAccount(publicKey);
      
      // Create the asset
      const asset = new StellarSDK.Asset(assetCode, assetIssuer);
      
      // Build the transaction to add the trustline
      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation(StellarSDK.Operation.changeTrust({
          asset: asset,
          limit: limit
        }))
        .setTimeout(30)
        .build();
      
      // Sign the transaction
      transaction.sign(keypair);
      
      // Submit to the network
      const transactionResult = await this.server.submitTransaction(transaction);
      
      return {
        success: true,
        transactionId: transactionResult.id,
        ledger: transactionResult.ledger,
        hash: transactionResult.hash
      };
    } catch (error: unknown) {
      console.error('Error adding trustline:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get common Stellar assets with issuers
   * @returns {Array} List of common Stellar assets
   */
  getCommonAssets() {
    return [
      {
        code: 'XLM',
        name: 'Stellar Lumens',
        issuer: null,
        type: 'native'
      },
      {
        code: 'USDC',
        name: 'USD Coin',
        issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        type: 'credit_alphanum4'
      },
      {
        code: 'yUSDC',
        name: 'Wrapped USDC',
        issuer: 'GADUOYRGUXBTKDWGVCL2ZGEIRXG3ONYSGI4AMM3YVNM2H3JAWQVEXW3I',
        type: 'credit_alphanum12'
      },
      {
        code: 'yXLM',
        name: 'Wrapped XLM',
        issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        type: 'credit_alphanum12'
      },
      {
        code: 'BTC',
        name: 'Bitcoin',
        issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
        type: 'credit_alphanum4'
      },
      {
        code: 'ETH',
        name: 'Ethereum',
        issuer: 'GBFXOHVAS43OIWNIO7XLRJAHT3BICFEIKDGBGPTTGDDPCF5GNVI5CKNY',
        type: 'credit_alphanum4'
      }
    ];
  }
}

// Export a singleton instance
export const stellarService = new StellarService();