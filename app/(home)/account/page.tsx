// app/account/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AccountDetails from './account-details';

export default function AccountPage() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoadAccount = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    setShowDetails(true);
    
    // Reset loading state after a short delay to allow account details to load
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-5 w-full bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Account Management</h1>
      <p className="mb-6">Manage your Stellar account and trustlines</p>

      <div className="bg-black text-white border p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Account Information</h2>
        <p className="text-white-600 mb-4">View and manage your Stellar account</p>
        
        <div className="mb-4 flex flex-col gap-2">
          <label className="block text-whitemb-2">Public Key (Address)</label>
          <div className="flex">
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="flex-1 p-2 border rounded bg-black text-white placeholder:text-white"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(publicKey)}
              className="ml-2 px-3 py-2 bg-black rounded border"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>
        
        <div className="mb-4 flex flex-col gap-1.5">
          <label className="block text-white mb-2">Secret Key (Keep this private!)</label>
          <div className="flex">
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="flex-1 p-2 border rounded bg-black text-white placeholder:text-white"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(secretKey)}
              className="ml-2 px-3 py-2 bg-black rounded border"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
          <p className="text-sm text-white mt-1">⚠️ Never share your secret key! Anyone with this key can access your funds.</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleLoadAccount}
            disabled={isLoading || !publicKey}
            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load Account'}
          </button>
          
          <button
            onClick={() => {
              // Logic for creating new account
              window.location.href = '/create-account'; // Or handle via client-side routing
            }}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            Create New Account
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="bg-white p-6 rounded-lg shadow">
          <AccountDetails 
            key={publicKey} 
            publicKey={publicKey} 
            secretKey={secretKey} 
          />
        </div>
      )}
    </div>
  );
}