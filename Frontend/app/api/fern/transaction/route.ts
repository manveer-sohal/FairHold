// app/api/fern/transaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fernFetch } from "/Users/manveersohal/leasevault/lib/fern";

export async function POST(req: NextRequest) {
  const { paymentAccountId, quoteId, destinationAddress } = await req.json();

  const tx = await fernFetch(`/v1/transactions`, {
    method: "POST",
    body: JSON.stringify({
      paymentAccountId,
      quoteId,
      destinationAddress,
      // optional: redirect URLs after checkout completes/cancels
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/funding/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/funding/cancel`,
    }),
  });

  // Many providers return a hosted checkout URL you can open in a new tab or iframe
  return NextResponse.json({ transaction: tx });
}
