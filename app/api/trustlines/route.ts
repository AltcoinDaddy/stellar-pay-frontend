// app/api/trustlines/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get("publicKey");

  if (!publicKey) {
    return NextResponse.json(
      { success: false, error: "Public key is required" },
      { status: 400 }
    );
  }

  try {
    // Use the Horizon API directly
    const response = await fetch(
      `https://horizon.stellar.org/accounts/${publicKey}`
    );

    if (response.status === 404) {
      return NextResponse.json({
        success: false,
        exists: false,
        error:
          "Account not found. It has not been activated on the network yet.",
        trustlines: [],
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const account = await response.json();

    // Filter out the native balance (XLM) to get only trustlines
    const trustlines = account.balances.filter(
      (b: any) => b.asset_type !== "native"
    );

    return NextResponse.json({
      success: true,
      exists: true,
      trustlines,
    });
  } catch (error: any) {
    console.error("Error getting trustlines:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch trustlines",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log the request body for debugging
    console.log("Request body:", body);

    const { secretKey, assetCode, assetIssuer } = body;

    if (!secretKey || !assetCode || !assetIssuer) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/create-trustline`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          assetCode,
          assetIssuer,
        }),
      }
    );

    // Log response status for debugging
    console.log("Standalone service response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from standalone service:", errorText);
      throw new Error(`Error from Stellar service: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Successfully got response from standalone service");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/trustlines POST handler:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add trustline",
      },
      { status: 500 }
    );
  }
}
