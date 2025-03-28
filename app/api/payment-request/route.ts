// app/api/payment-request/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      destinationAddress, 
      amount, 
      assetCode = 'XLM', 
      memo = '' 
    } = body;
    
    if (!destinationAddress || !amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Create a Stellar payment URI
    let paymentUrl = `web+stellar:pay?destination=${destinationAddress}&amount=${amount}`;
    
    // Add asset details if not XLM
    if (assetCode !== 'XLM') {
      paymentUrl += `&asset_code=${assetCode}`;
    }
    
    // Add memo if provided
    if (memo) {
      paymentUrl += `&memo=${encodeURIComponent(memo)}`;
    }
    
    return NextResponse.json({
      success: true,
      paymentUrl,
      destinationAddress,
      amount,
      assetCode,
      memo
    });
  } catch (error: any) {
    console.error('Error creating payment request:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create payment request' 
    }, { status: 500 });
  }
}