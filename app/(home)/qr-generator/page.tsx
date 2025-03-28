'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Copy, Check, Gamepad2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export default function QRGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    destinationAddress: '',
    amount: '',
    assetCode: 'XLM',
    memo: '',
    memoType: 'text' as 'text' | 'id' | 'hash' | 'return'
  });
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      // Basic validation
      if (!formData.destinationAddress.startsWith('G') || formData.destinationAddress.length < 56) {
        throw new Error('Invalid Stellar address format');
      }
      
      if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        throw new Error('Please enter a valid positive amount');
      }

      const response = await fetch('/api/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to generate QR code');
      
      setQrData(data.paymentUrl);
      toast({
        title: "Success",
        description: "Payment QR code generated successfully",
      });

    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Payment URL copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Payment QR Generator
        </h1>
        <p className="text-white">
          Create scannable payment requests for instant transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black text-whitw">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="">
                <RefreshCw className="w-6 h-6 text-white" />
              </span>
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Stellar Address</Label>
              <Input
                value={formData.destinationAddress}
                onChange={(e) => setFormData({...formData, destinationAddress: e.target.value})}
                placeholder="G..."
                className=" text-white placeholder:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className=" text-white placeholder:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <select
                  value={formData.assetCode}
                  onChange={(e) => setFormData({...formData, assetCode: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-black text-white"
                >
                  <option value="XLM">XLM</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Memo Type</Label>
                <select
                  value={formData.memoType}
                  onChange={(e) => setFormData({...formData, memoType: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-black text-white"
                >
                  <option value="text">Text</option>
                  <option value="id">ID</option>
                  <option value="hash">Hash</option>
                  <option value="return">Return</option>
                </select>
              </div>
              <div className="space-y-2 text-white">
                <Label>Memo</Label>
                <Input
                  value={formData.memo}
                  onChange={(e) => setFormData({...formData, memo: e.target.value})}
                  placeholder="Optional reference"
                  className=" text-white placeholder:text-white"
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateQR}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </div>
              ) : (
                'Generate QR Code'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="">
                <Check className="w-6 h-6 text-white" />
              </span>
              Payment QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
            {qrData ? (
              <>
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <QRCodeSVG 
                    value={qrData} 
                    size={256}
                    includeMargin
                    fgColor="#1a1a1a"
                    bgColor="#ffffff"
                  />
                </div>
                <div className="w-full space-y-2 !text-white">
                  <Label>Payment URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={qrData}
                      readOnly
                      className="text-sm text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="aspect-square p-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-white">
                
                <p className="mb-2 font-bold text-2xl">No QR code generated</p>
                <p className="text-sm">Configure payment details and click generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}