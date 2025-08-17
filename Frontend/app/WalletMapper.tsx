"use client";

import {
  useDynamicContext,
  useUserWallets,
  useUserUpdateRequest,
} from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

export default function WalletMapper() {
  const { setShowAuthFlow, user } = useDynamicContext();
  const wallets = useUserWallets();
  const { updateUser } = useUserUpdateRequest();

  const evmWallets = wallets?.filter(isEthereumWallet) ?? [];
  const walletMap = ((user?.metadata as any)?.walletMap ?? {}) as {
    customer?: string;
    vendor?: string;
  };

  async function assign(role: "customer" | "vendor", walletId: string) {
    const updated = { ...(walletMap || {}), [role]: walletId };
    await updateUser({ metadata: { walletMap: updated } });
  }

  return (
    <section
      style={{
        marginTop: 24,
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <h2>Map wallets to roles</h2>
      <button
        onClick={() => setShowAuthFlow(true)}
        style={{ marginBottom: 12 }}
      >
        Add / Connect another wallet
      </button>

      <div style={{ display: "grid", gap: 8 }}>
        {evmWallets.length === 0 && <div>No wallets connected yet.</div>}
        {evmWallets.map((w: any) => (
          <div
            key={w.id}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
          >
            <div>
              <strong>Wallet {String(w.id).slice(0, 6)}…</strong>
            </div>
            <div>Connector Address: {w?.address}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={() => assign("customer", w.id)}>
                Use as Customer {walletMap.customer === w.id ? "✓" : ""}
              </button>
              <button onClick={() => assign("vendor", w.id)}>
                Use as Vendor {walletMap.vendor === w.id ? "✓" : ""}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
