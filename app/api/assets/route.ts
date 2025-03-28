// app/api/assets/route.ts
import { NextResponse } from 'next/server';
import { StellarService } from '@/services/stellar.server';

// Create service instance in the API route
const stellarService = new StellarService();

export async function GET() {
  try {
    const assets = stellarService.getCommonAssets();
    return NextResponse.json({ 
      success: true, 
      assets
    });
  } catch (error: any) {
    console.error('Error in assets API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch assets' 
    }, { status: 500 });
  }
}