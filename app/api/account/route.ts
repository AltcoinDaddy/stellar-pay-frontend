// app/api/account/route.ts
import { NextResponse } from 'next/server';
import { horizonClient } from '@/services/stellar.horizon';

// Use the direct Horizon API client instead of the StellarService
// This avoids the issue with Stellar SDK in Next.js

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get('publicKey');
  
  if (!publicKey) {
    return NextResponse.json({ success: false, error: 'Public key is required' }, { status: 400 });
  }
  
  try {
    const result = await horizonClient.getAccount(publicKey);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in account API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch account' 
    }, { status: 500 });
  }
}