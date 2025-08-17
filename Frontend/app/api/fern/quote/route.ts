// app/api/fern/quote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fernFetch } from "/Users/manveersohal/leasevault/lib/fern";

export async function POST(req: NextRequest) {
  const { paymentAccountId, fiatAmount, fiatCurrency, assetSymbol, network } =
    await req.json();

  const quote = await fernFetch(`/v1/quotes`, {
    method: "POST",
    body: JSON.stringify({
      // Onramp is inferred by source=fiat & destination=crypto per Fern docs
      source: { currency: fiatCurrency ?? "USD", amount: fiatAmount ?? "100" },
      destination: { asset: assetSymbol ?? "USDC", network: network ?? "base" },
      paymentAccountId,
    }),
  });

  return NextResponse.json({ quote });
}
