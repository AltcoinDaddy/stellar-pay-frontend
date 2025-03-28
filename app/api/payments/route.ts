// app/api/payments/route.ts
import { NextResponse } from 'next/server';
import { horizonClient } from '@/services/stellar.horizon';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get('publicKey');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  
  if (!publicKey) {
    return NextResponse.json({ success: false, error: 'Public key is required' }, { status: 400 });
  }
  
  try {
    const result = await horizonClient.getPaymentHistory(publicKey, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in payments API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch payment history' 
    }, { status: 500 });
  }
}

// Add POST method handler
export async function POST(request: Request) {
  try {
    // For now, just return a simple response to confirm the endpoint works
    return NextResponse.json({ 
      success: true, 
      message: 'Payment endpoint is working'
    });
  } catch (error: any) {
    console.error('Error in payment API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to process payment' 
    }, { status: 500 });
  }
}