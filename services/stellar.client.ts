// services/stellar.client.ts
// A client-side alternative that doesn't use the Stellar SDK directly

/**
 * Client-side service for interacting with Stellar via API routes
 * This avoids the direct use of Stellar SDK in the browser
 */
export class StellarClientService {
    /**
     * Get account details from the Stellar network
     * @param {string} publicKey - The account's public key
     * @returns {Promise<Object>} Account details
     */
    async getAccount(publicKey: string) {
      try {
        const response = await fetch(`/api/account?publicKey=${publicKey}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error loading account:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    /**
     * Get payment history for an account
     * @param {string} publicKey - The account's public key
     * @param {number} limit - Maximum number of transactions to return
     * @returns {Promise<Object>} Transaction history
     */
    async getPaymentHistory(publicKey: string, limit: number = 10) {
      try {
        const response = await fetch(`/api/payments?publicKey=${publicKey}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error getting payment history:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    /**
     * Create a payment request
     * @param {string} destinationAddress - Destination Stellar address
     * @param {string} amount - Payment amount
     * @param {string} assetCode - Asset code (XLM, USDC, etc.)
     * @param {string} assetIssuer - Asset issuer for non-native assets
     * @param {string} memo - Optional memo for the payment
     * @returns {Promise<Object>} Payment request details
     */
    async createPaymentRequest(
      destinationAddress: string, 
      amount: string, 
      assetCode: string, 
      assetIssuer: string | null = null,
      memo: string = ''
    ) {
      try {
        const response = await fetch('/api/payment-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destinationAddress,
            amount,
            assetCode,
            assetIssuer,
            memo
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error creating payment request:', error);
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
        const response = await fetch(`/api/account/check?publicKey=${publicKey}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
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
        let url = `/api/balance?publicKey=${publicKey}&assetCode=${assetCode}`;
        
        if (assetIssuer) {
          url += `&assetIssuer=${assetIssuer}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error getting asset balance:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    /**
     * Get common Stellar assets with issuers
     * @returns {Promise<Object>} List of common Stellar assets
     */
    async getCommonAssets() {
      try {
        const response = await fetch('/api/assets');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error getting common assets:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    /**
     * Send a payment (client side wrapper for the API)
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} Transaction result
     */
    async sendPayment(paymentData: {
      sourceSecret: string,
      destinationAddress: string,
      amount: string,
      assetCode?: string,
      assetIssuer?: string | null,
      memo?: string
    }) {
      try {
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error sending payment:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    /**
     * Add a trustline (client side wrapper for the API)
     * @param {Object} trustlineData - Trustline data
     * @returns {Promise<Object>} Transaction result
     */
    async addTrustline(trustlineData: {
      secretKey: string,
      assetCode: string,
      assetIssuer: string,
      limit?: string
    }) {
      try {
        const response = await fetch('/api/trustline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trustlineData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error adding trustline:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  }
  
  // Export a singleton instance for client components to use
  export const stellarClientService = new StellarClientService();