// app/api/fern/payment-account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fernFetch } from "/Users/manveersohal/leasevault/lib/fern";

export async function POST(req: NextRequest) {
  const { walletAddress } = await req.json();

  // idempotent lookup-or-create pattern (pseudo endpoints/fields)
  // 1) Try to find existing account for this wallet
  // 2) If not found, create it
  // Replace with Fern’s actual endpoints/filters (see your workspace docs)
  const account = await fernFetch(`/v1/payment-accounts`, {
    method: "POST",
    body: JSON.stringify({
      reference: walletAddress.toLowerCase(), // your own reference key
      destinationAddress: walletAddress,
      destinationNetwork: "base", // or "base-sepolia" in test
    }),
  });

  return NextResponse.json({ account });
}
