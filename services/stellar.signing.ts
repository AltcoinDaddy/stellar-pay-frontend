// services/stellar.signing.ts
export class StellarSigningService {
    private baseUrl: string;
  
    constructor(serviceUrl: string = `${process.env.NEXT_PUBLIC_API_URL}`) {
      this.baseUrl = serviceUrl;
    }
  
    async createKeypair() {
      try {
        const response = await fetch(`${this.baseUrl}/api/create-keypair`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error creating keypair:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    async createPayment(paymentData: {
      sourceSecret: string,
      destinationAddress: string,
      amount: string,
      assetCode?: string,
      assetIssuer?: string | null
    }) {
      try {
        const response = await fetch(`${this.baseUrl}/api/create-payment`, {
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
        console.error('Error creating payment:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    async submitTransaction(signedXDR: string) {
      try {
        const response = await fetch(`${this.baseUrl}/api/submit-transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signedXDR }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error: unknown) {
        console.error('Error submitting transaction:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  
    async createTrustline(trustlineData: {
      secretKey: string,
      assetCode: string,
      assetIssuer: string,
      limit?: string
    }) {
      try {
        const response = await fetch(`${this.baseUrl}/api/create-trustline`, {
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
        console.error('Error creating trustline:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  }
  
  export const stellarSigningService = new StellarSigningService();