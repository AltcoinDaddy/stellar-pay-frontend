// services/stellar.horizon.ts

/**
 * Direct Horizon API client to interact with Stellar network
 * This avoids dependencies on the Stellar SDK and can be used from both client and server side
 */
export class HorizonClient {
    private baseUrl: string;
  
    constructor(horizonUrl: string = 'https://horizon.stellar.org') {
      this.baseUrl = horizonUrl;
    }
  
    /**
     * Check if an account exists on the Stellar network
     * @param {string} publicKey - The account's public key
     * @returns {Promise<Object>} Account status
     */
    async checkAccountExists(publicKey: string) {
      try {
        const response = await fetch(`${this.baseUrl}/accounts/${publicKey}`);
        
        if (response.status === 404) {
          return {
            success: true,
            exists: false,
            message: 'Account not found. It has not been activated on the network yet.'
          };
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return {
          success: true,
          exists: true,
          message: 'Account exists on the network'
        };
      } catch (error: unknown) {
        console.error('Error checking account:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    /**
     * Get account details from the Stellar network
     * @param {string} publicKey - The account's public key
     * @returns {Promise<Object>} Account details
     */
    async getAccount(publicKey: string) {
      try {
        const response = await fetch(`${this.baseUrl}/accounts/${publicKey}`);
        
        if (response.status === 404) {
          return {
            success: false,
            exists: false,
            error: 'Account not found. It has not been activated on the network yet.'
          };
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const account = await response.json();
        return {
          success: true,
          account,
          exists: true
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
     * Get payment transactions for an account
     * @param {string} publicKey - The account's public key
     * @param {number} limit - Maximum number of transactions to return
     * @returns {Promise<Object>} Transaction history
     */
    async getPaymentHistory(publicKey: string, limit: number = 10) {
      try {
        // First check if the account exists
        const accountCheck = await this.checkAccountExists(publicKey);
        if (!accountCheck.exists) {
          return {
            success: false,
            exists: false,
            error: 'Account not found. It has not been activated on the network yet.',
            payments: []
          };
        }
        
        const response = await fetch(
          `${this.baseUrl}/accounts/${publicKey}/payments?limit=${limit}&order=desc`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        return {
          success: true,
          exists: true,
          payments: result._embedded?.records || []
        };
      } catch (error: unknown) {
        console.error('Error getting payment history:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          payments: []
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
        const accountResult = await this.getAccount(publicKey);
        
        if (!accountResult.success || !accountResult.exists) {
          return {
            success: false,
            exists: false,
            error: 'Account not found',
            balance: '0'
          };
        }
        
        const account = accountResult.account;
        
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
              exists: true,
              balances: assetBalances
            };
          } else {
            balance = '0';
          }
        }
        
        return {
          success: true,
          exists: true,
          balance
        };
      } catch (error: unknown) {
        console.error('Error getting asset balance:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          balance: '0'
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
  
  // Export a singleton instance that can be used everywhere
  export const horizonClient = new HorizonClient();