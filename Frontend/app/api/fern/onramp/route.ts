// app/api/fern/onramp/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { walletAddress, fiatAmount, asset } = await req.json();

  // 1) ensure payment account for this user+wallet
  // 2) create quote: source fiat -> dest crypto (e.g., USDC on Base)
  // 3) create transaction with destinationAddress = walletAddress
  // 4) return hosted checkout URL or token for embedded widget

  // PSEUDO (replace with actual Fern endpoints & keys)
  const checkoutUrl = "https://pay.fernhq.com/session/abc123";
  return NextResponse.json({ checkoutUrl });
}
/*
If Fern’s widget requires including a JS snippet or an iframe, embed that on a /fund page and pass the client token/session id from your server.
*/

// //<button
//   className="btn"
//   onClick={async () => {
//     const res = await fetch("/api/fern/onramp", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ walletAddress: customerAddr, fiatAmount: "100", asset: "USDC" }),
//     });
//     const { checkoutUrl } = await res.json();
//     if (checkoutUrl) window.open(checkoutUrl, "_blank");
//   }}
// >
//   On-Ramp Funds (Apple Pay)
// </button>
