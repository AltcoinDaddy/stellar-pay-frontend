// app/api/payment/route.ts
import { NextResponse } from 'next/server';
import { stellarSigningService } from '@/services/stellar.signing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      sourceSecret, 
      destinationAddress, 
      amount, 
      assetCode = 'XLM', 
      assetIssuer = null
    } = body;
    
    if (!sourceSecret || !destinationAddress || !amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Step 1: Create the signed transaction
    const createResult = await stellarSigningService.createPayment({
      sourceSecret,
      destinationAddress,
      amount,
      assetCode,
      assetIssuer
    });
    
    if (!createResult.success) {
      return NextResponse.json(createResult, { status: 500 });
    }
    
    // Step 2: Submit the transaction
    const submitResult = await stellarSigningService.submitTransaction(createResult.signedXDR);
    
    return NextResponse.json(submitResult);
  } catch (error: any) {
    console.error('Error in payment API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send payment' 
    }, { status: 500 });
  }
}