// components/OnRampButton.tsx
"use client";
import { useState } from "react";

export function OnRampButton({
  walletAddress,
}: {
  walletAddress: `0x${string}`;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="btn btn-primary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          // 1) ensure account
          const accRes = await fetch("/api/fern/payment-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress }),
          });
          const { account } = await accRes.json();

          // 2) get quote
          const qRes = await fetch("/api/fern/quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentAccountId: account.id,
              fiatAmount: "100", // or your input field
              fiatCurrency: "USD",
              assetSymbol: "USDC", // or ETH
              network: "base", // base or base-sepolia
            }),
          });
          const { quote } = await qRes.json();

          // 3) transaction
          const tRes = await fetch("/api/fern/transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentAccountId: account.id,
              quoteId: quote.id,
              destinationAddress: walletAddress,
            }),
          });
          const { transaction } = await tRes.json();

          // 4) open checkout
          if (transaction?.checkoutUrl) {
            window.open(transaction.checkoutUrl, "_blank");
          } else {
            alert("No checkout URL returned.");
          }
        } catch (e: any) {
          alert(e?.message ?? "Onramp failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Starting onramp..." : "On-Ramp Funds (Apple Pay)"}
    </button>
  );
}
