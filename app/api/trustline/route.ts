// app/api/trustline/route.ts
import { NextResponse } from 'next/server';
import { StellarService } from '@/services/stellar.server';

// Create service instance in the API route
const stellarService = new StellarService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secretKey, assetCode, assetIssuer, limit } = body;
    
    if (!secretKey || !assetCode || !assetIssuer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters: secretKey, assetCode, or assetIssuer' 
      }, { status: 400 });
    }
    
    const result = await stellarService.addTrustline(
      secretKey,
      assetCode,
      assetIssuer,
      limit
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in trustline API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to add trustline' 
    }, { status: 500 });
  }
}