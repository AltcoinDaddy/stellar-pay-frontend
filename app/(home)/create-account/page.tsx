'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAccountPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const router = useRouter();

  const handleCreateAccount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make sure your standalone service is running on port 3002
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-keypair`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNewAccount({
          publicKey: data.publicKey,
          secretKey: data.secretKey
        });
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Create New Stellar Account</h1>
      <p className="mb-6">Generate a new Stellar keypair</p>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">New Account Generation</h2>
        
        {!newAccount ? (
          <div>
            <p className="mb-4">
              Click the button below to generate a new Stellar keypair. This will create your public and secret keys.
            </p>
            
            <div className="mb-6">
              <p className="text-yellow-700 bg-yellow-50 p-3 rounded">
                <span className="font-medium">Important:</span> The account will not be active on the Stellar network until it receives at least 1 XLM. You'll need to fund this account from an existing account or exchange.
              </p>
            </div>
            
            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate New Keypair'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded">
              <p className="font-medium">Account created successfully!</p>
              <p className="text-sm mt-2">
                Make sure to save your secret key somewhere safe. You won't be able to recover it if lost.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Public Key (Address)</label>
              <div className="flex">
                <input
                  type="text"
                  value={newAccount.publicKey}
                  readOnly
                  className="flex-1 p-2 border rounded bg-gray-50"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(newAccount.publicKey)}
                  className="ml-2 px-3 py-2 bg-gray-200 rounded"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Secret Key (Keep this private!)</label>
              <div className="flex">
                <input
                  type="password"
                  value={newAccount.secretKey}
                  readOnly
                  className="flex-1 p-2 border rounded bg-gray-50"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(newAccount.secretKey)}
                  className="ml-2 px-3 py-2 bg-gray-200 rounded"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
              <p className="text-sm text-red-600 mt-1">⚠️ Never share your secret key! Anyone with this key can access your funds.</p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/account?publicKey=${newAccount.publicKey}&secretKey=${newAccount.secretKey}`)}
                className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
              >
                Go to Account Management
              </button>
              
              <button
                onClick={() => setNewAccount(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Create Another Account
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">What to do next</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">1. Fund your account</h3>
            <p className="mt-1">
              Send at least 1 XLM to your new account address to activate it on the Stellar network.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">2. Store your secret key safely</h3>
            <p className="mt-1">
              Your secret key is the only way to access your funds. Keep it in a secure place and never share it.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">3. Add trustlines (optional)</h3>
            <p className="mt-1">
              To hold assets other than XLM, you'll need to set up trustlines for those assets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}