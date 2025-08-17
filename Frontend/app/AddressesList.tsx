"use client";

import React, { useEffect, useState } from "react";
import { useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";

export default function AddressesList() {
  const wallets = useUserWallets();
  const evmWallets = wallets?.filter(isEthereumWallet) ?? [];

  if (evmWallets.length === 0) return null;

  return (
    <section
      style={{
        marginTop: 24,
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <h2>Connected Wallets (AA & EOA)</h2>
      <ul style={{ display: "grid", gap: 10 }}>
        {evmWallets.map((w: any) => (
          <li key={w.id} style={{ listStyle: "none" }}>
            <div>
              <strong>Wallet {String(w.id).slice(0, 6)}…</strong>
            </div>
            {/* In AA mode this is typically the Smart Account (contract) address */}
            <div>Smart/Connector Address: {w.address}</div>
            <EOAAddress wallet={w} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function EOAAddress({ wallet }: { wallet: any }) {
  const [addr, setAddr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = wallet?.connector;
        if (c && isZeroDevConnector(c)) {
          const signer = c.eoaConnector;
          const eoaAddr =
            typeof signer?.getAddress === "function"
              ? await signer.getAddress()
              : null;
          if (!cancelled) setAddr(eoaAddr ?? null);
        } else {
          if (!cancelled) setAddr(null);
        }
      } catch {
        if (!cancelled) setAddr(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  return <div>EOA Signer: {addr ?? "N/A"}</div>;
}
