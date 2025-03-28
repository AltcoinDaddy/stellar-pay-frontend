// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  RefreshCw, 
  ChevronRight, 
  Wallet, 
  DollarSign, 
  Copy, 
  Check, 
  Clock,
  ExternalLink,
  ArrowUpDown
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  amount: string;
  asset: string;
  from: string;
  to: string;
  memo: string;
  status: 'success' | 'pending' | 'failed';
}

interface AssetBalance {
  asset: string;
  balance: string;
  issuer?: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [stellarAddress, setStellarAddress] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem('stellarAddress');
    if (storedAddress) {
      setStellarAddress(storedAddress);
      fetchAccountData(storedAddress);
    }
  }, []);

  const saveAddress = () => {
    if (stellarAddress.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a valid Stellar address",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('stellarAddress', stellarAddress);
    fetchAccountData(stellarAddress);
    
    toast({
      title: "Success",
      description: "Address saved and account data loaded",
    });
  };

  const fetchAccountData = async (address: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/account?publicKey=${address}`);
      const data = await response.json();
      
      if (!data.exists) {
        toast({
          title: "Account Not Found",
          description: "This Stellar address has not been activated on the network yet.",
          variant: "destructive"
        });
        setBalances([]);
        setTransactions([]);
        setIsLoading(false);
        return;
      }
      
      const balancesData = data.account?.balances || [];
      const formattedBalances = balancesData.map((b: any) => ({
        asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
        balance: b.balance,
        issuer: b.asset_issuer
      }));
      
      setBalances(formattedBalances);
      
      const txResponse = await fetch(`/api/payments?accountId=${address}`);
      const txData = await txResponse.json();
      
      if (txData.success && txData.payments) {
        const formattedTx = txData.payments.map((p: any) => ({
          id: p.id || p.transaction_hash || Math.random().toString(36).substring(2, 10),
          date: new Date(p.created_at).toLocaleString(),
          amount: p.amount || '0',
          asset: p.asset_code || 'XLM',
          from: p.from || 'Unknown',
          to: p.to || 'Unknown',
          memo: p.memo || '',
          status: 'success'
        }));
        setTransactions(formattedTx);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast({
        title: "Error",
        description: "Failed to load account data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(stellarAddress);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Stellar address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const viewOnExplorer = () => {
    if (stellarAddress) {
      window.open(`https://stellar.expert/explorer/public/account/${stellarAddress}`, '_blank');
    }
  };

  const formatAmount = (amount: string, asset: string) => {
    return `${parseFloat(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 7
    })} ${asset}`;
  };

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white text-transparent">
          Stellar Merchant Dashboard
        </h1>
        <p className="text-white">
          Monitor your Stellar payments and account activity in real-time
        </p>
      </div>
      
      <Card className="bg-black text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="">
              <Wallet className="w-6 h-6 text-white" />
            </span>
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-white">
                Stellar Address
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  className="font-mono border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors"
                  placeholder="GABCD1234..."
                  value={stellarAddress}
                  onChange={(e) => setStellarAddress(e.target.value)}
                />
                <Button 
                  onClick={saveAddress} 
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 transition-all min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="animate-pulse">Checking...</span>
                    </div>
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            </div>
            {stellarAddress && (
              <div className="flex items-end gap-2 max-sm:items-center">
                <Button
                  variant="outline"
                  onClick={copyAddress}
                  className="bg-black text-white"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={viewOnExplorer}
                  className="bg-black text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {stellarAddress && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow bg-black text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <CardDescription className="mt-1">Digital currencies</CardDescription>
                </div>
                <div className="p-3 rounded-full ">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                  ) : (
                    balances.length
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-black text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">XLM Balance</CardTitle>
                  <CardDescription className="mt-1">Native currency</CardDescription>
                </div>
                <div className="p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                  ) : (
                    balances.find(b => b.asset === 'XLM')?.balance || '0.00'
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-black text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <CardDescription className="mt-1">Last 30 days</CardDescription>
                </div>
                <div className="p-3 rounded-full bg-black">
                  <ArrowUpDown className="w-6 h-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                  ) : (
                    transactions.length
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card className="hover:shadow-lg transition-shadow bg-black text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className='flex flex-col gap-2'>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Recent payment activity</CardDescription>
                  </div>
                  <Button variant="outline" className="hidden md:flex bg-black border text-white hover:bg-none">
                    View All <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
                      </div>
                    ))}
                    <p className="text-sm text-center text-white">
                      Verifying account details...
                    </p>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className=" rounded-lg overflow-hidden">
                    <Table className="min-w-[700px] bg-black text-white">
                      <TableHeader className="bg-gray-50 dark:bg-gray-800">
                        <TableRow>
                          <TableHead className="w-[180px]">Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Direction</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium">
                              {new Date(tx.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {formatAmount(tx.amount, tx.asset)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {tx.from === stellarAddress ? (
                                <Badge variant="outline" className="border-red-100 text-red-600">
                                  Outgoing
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-green-100 text-green-600">
                                  Incoming
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={cn(
                                  'px-2 py-1 text-xs',
                                  tx.status === 'success' && 'bg-green-100 text-green-700',
                                  tx.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                                  tx.status === 'failed' && 'bg-red-100 text-red-700'
                                )}
                              >
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Clock className="h-12 w-12 text-white" />
                    <div className="text-center">
                      <h3 className="font-medium">No transactions yet</h3>
                      <p className="text-sm text-white">
                        Your transactions will appear here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-black text-white">
              <CardHeader>
                <CardTitle>Asset Balances</CardTitle>
                <CardDescription>Available in your account</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : balances.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="">
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead className="hidden md:table-cell">Issuer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {balances.map((balance, index) => (
                          <TableRow key={index} className="">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {balance.asset === 'XLM' ? (
                                  <div className="w-6 h-6 rounded-full bg-blue-500" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-purple-500" />
                                )}
                                {balance.asset}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {parseFloat(balance.balance).toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-white">
                              {balance.issuer ? 
                                `${balance.issuer.slice(0, 4)}...${balance.issuer.slice(-4)}` : 
                                'Native'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Wallet className="h-12 w-12 text-white" />
                    <div className="text-center">
                      <h3 className="font-medium">No assets found</h3>
                      <p className="text-sm text-white">
                        Your assets will appear here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}