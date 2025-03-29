'use client';
import { useState, useEffect } from 'react';

// Define the interface for the component props
interface AccountDetailsProps {
  publicKey: string;
  secretKey: string;
}

// Define the structure of the account data
interface AccountData {
  success: boolean;
  exists?: boolean;
  account?: {
    balances?: Array<{
      asset_type: string;
      asset_code?: string;
      asset_issuer?: string;
      balance: string;
    }>;
    sequence?: string;
  };
  error?: string;
}

export default function AccountDetails({ publicKey, secretKey }: AccountDetailsProps) {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchAccountData() {
      if (!publicKey) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/account?publicKey=${publicKey}`);
        const data = await response.json();
        console.log('API Response:', data);
        
        setAccount(data);
      } catch (err) {
        console.error('Error fetching account:', err);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAccountData();
  }, [publicKey]);
  
  if (loading) return <div>Loading account details...</div>;
  
  if (!account?.success || !account?.exists) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-medium text-yellow-800">Account Not Found</h3>
        <p className="text-yellow-700">
          This account doesn&apos;t exist on the Stellar network yet. You need to fund it with at least 1 XLM to activate it.
        </p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-medium text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Account Details</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Balances</h3>
          <div className="mt-2 space-y-2">
            {account.account?.balances?.map((balance, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                {balance.asset_type === 'native' ? (
                  <p><span className="font-medium">XLM:</span> {parseFloat(balance.balance).toFixed(7)}</p>
                ) : (
                  <p>
                    <span className="font-medium">{balance.asset_code}:</span> {parseFloat(balance.balance).toFixed(7)}
                    <span className="block text-xs text-gray-500">Issuer: {balance.asset_issuer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium">Account ID</h3>
          <p className="mt-1 text-sm">{publicKey}</p>
        </div>
        
        <div>
          <h3 className="font-medium">Sequence Number</h3>
          <p className="mt-1 text-sm">{account.account?.sequence}</p>
        </div>
      </div>
    </div>
  );
}