// app/api/account/check/route.ts
import { NextResponse } from 'next/server';
import { StellarService } from '@/services/stellar.server';

// Create service instance in the API route
const stellarService = new StellarService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get('publicKey');
  
  if (!publicKey) {
    return NextResponse.json({ success: false, error: 'Public key is required' }, { status: 400 });
  }
  
  try {
    const result = await stellarService.checkAccountExists(publicKey);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in account check API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to check account' 
    }, { status: 500 });
  }
}