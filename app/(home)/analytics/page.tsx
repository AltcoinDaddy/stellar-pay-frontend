// app/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Define types for our data structures
interface AssetData {
  code: string;
  balance: string;
  value: number;
  percentage: number;
}

interface TransactionData {
  date: string;
  amount: number;
  asset: string;
}

interface VolumeData {
  date: string;
  volume: number;
}

interface AssetCount {
  asset: string;
  count: number;
}

interface Balance {
  asset_type: string;
  asset_code?: string;
  balance: string;
}

export default function AnalyticsPage() {
  const [stellarAddress, setStellarAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [assetData, setAssetData] = useState<AssetData[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionData[]>([]);
  const [dailyVolume, setDailyVolume] = useState<VolumeData[]>([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Load stored address on component mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('stellarAddress');
    if (storedAddress) {
      setStellarAddress(storedAddress);
      loadAccountData(storedAddress);
    }
  }, []);

  const loadAccountData = async (address: string) => {
    if (!address) {
      alert("Please enter a Stellar address");
      return;
    }

    setIsLoading(true);
    localStorage.setItem('stellarAddress', address);

    try {
      // Fetch account details
      const accountResponse = await fetch(`/api/account?publicKey=${address}`);
      const accountData = await accountResponse.json();

      if (!accountData.exists) {
        alert("Account Not Found: This Stellar address has not been activated on the network yet.");
        setIsLoading(false);
        return;
      }

      // Process account balances
      if (accountData.account && accountData.account.balances) {
        processAssetData(accountData.account.balances);
      }

      // Fetch payment history
      const paymentsResponse = await fetch(`/api/payments?accountId=${address}`);
      const paymentsData = await paymentsResponse.json();

      if (paymentsData.success && paymentsData.payments) {
        processTransactionData(paymentsData.payments);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      alert("Failed to load account data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const processAssetData = (balances: Balance[]) => {
    // Convert balances to asset data with percentages
    const assets: AssetData[] = balances.map(balance => ({
      code: balance.asset_type === 'native' ? 'XLM' : balance.asset_code || 'Unknown',
      balance: balance.balance,
      value: parseFloat(balance.balance),
      percentage: 0 // Will be calculated below
    }));

    // Calculate total value (simplified - in a real app would need proper conversion rates)
    const total = assets.reduce((sum: number, asset: AssetData) => sum + asset.value, 0);
    
    // Add percentage to each asset
    const assetsWithPercentage: AssetData[] = assets.map(asset => ({
      ...asset,
      percentage: (asset.value / total) * 100
    }));

    setAssetData(assetsWithPercentage);
  };

  interface Payment {
    created_at: string;
    amount?: string;
    asset_code?: string;
  }

  const processTransactionData = (payments: Payment[]) => {
    // Format for transaction history
    const transactions: TransactionData[] = payments.map(payment => ({
      date: new Date(payment.created_at).toISOString().split('T')[0], // YYYY-MM-DD
      amount: parseFloat(payment.amount || '0'),
      asset: payment.asset_code || 'XLM'
    }));

    setTransactionHistory(transactions);

    // Group by date for daily volume chart
    const volumeByDate: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (!volumeByDate[tx.date]) volumeByDate[tx.date] = 0;
      volumeByDate[tx.date] += tx.amount;
    });

    // Convert to chart data format
    const volumeData: VolumeData[] = Object.keys(volumeByDate).map(date => ({
      date,
      volume: volumeByDate[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    setDailyVolume(volumeData);
  };

  // Create transaction count data
  const getTransactionCountData = (): AssetCount[] => {
    const counts: { [key: string]: number } = {};
    transactionHistory.forEach(tx => {
      if (!counts[tx.asset]) counts[tx.asset] = 0;
      counts[tx.asset]++;
    });
    
    return Object.keys(counts).map(asset => ({
      asset,
      count: counts[asset]
    }));
  };

  return (
    <div className="space-y-6 w-full">
      <div className='flex flex-col gap-3'>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-white">Analyze your payment data and trends</p>
      </div>

      <Card className='bg-black text-white'>
        <CardHeader>
          <CardTitle>Stellar Account</CardTitle>
          <CardDescription>Enter your Stellar address to view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Label htmlFor="stellarAddress" className="sr-only">Stellar Address</Label>
              <Input
                id="stellarAddress"
                placeholder="Enter your Stellar address (G...)"
                value={stellarAddress}
                onChange={(e) => setStellarAddress(e.target.value)}
              />
            </div>
            <Button onClick={() => loadAccountData(stellarAddress)} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Analytics'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      {stellarAddress && (
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'assets' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            Assets
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'transactions' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {stellarAddress && activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Asset Distribution */}
          <Card className='bg-black text-white'>
            <CardHeader>
              <CardTitle>Asset Distribution</CardTitle>
              <CardDescription>Breakdown of assets in your account</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {assetData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${typeof percent === 'number' ? percent.toFixed(0) : ''}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="code"
                    >
                      {assetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => {
                      return typeof value === 'number' ? `${value.toFixed(2)}%` : value;
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-white">No asset data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Volume */}
          <Card className="bg-black text-white">
            <CardHeader>
              <CardTitle>Daily Transaction Volume</CardTitle>
              <CardDescription>Payment volume over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dailyVolume.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Volume"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-white">No transaction data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Transaction Count by Asset */}
          <Card className="md:col-span-2 bg-black text-white">
            <CardHeader>
              <CardTitle>Transaction Count by Asset</CardTitle>
              <CardDescription>Number of transactions for each asset</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {transactionHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTransactionCountData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="asset" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Number of Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-white">No transaction data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assets Tab */}
      {stellarAddress && activeTab === 'assets' && (
        <Card className='bg-black text-white'>
          <CardHeader>
            <CardTitle>Asset Holdings</CardTitle>
            <CardDescription>Detailed breakdown of your assets</CardDescription>
          </CardHeader>
          <CardContent>
            {assetData.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Asset</th>
                    <th className="text-right p-2">Balance</th>
                    <th className="text-right p-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {assetData.map((asset, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{asset.code}</td>
                      <td className="text-right p-2">{asset.balance}</td>
                      <td className="text-right p-2">{asset.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-white">No asset data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transactions Tab */}
      {stellarAddress && activeTab === 'transactions' && (
        <Card className='bg-black text-white'>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Detailed view of your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionHistory.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-left p-2">Asset</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((tx, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{tx.date}</td>
                      <td className="text-right p-2">{tx.amount.toFixed(6)}</td>
                      <td className="p-2">{tx.asset}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-white">No transaction data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}