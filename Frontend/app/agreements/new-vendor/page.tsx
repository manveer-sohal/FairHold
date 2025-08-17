"use client";

import { useEffect, useMemo, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useRouter } from "next/navigation";

export default function NewVendorDraft() {
  const {
    wallets,
    primaryWallet,
    isAuthenticated,
    user,
    setShowAuthFlow,
    setShowLinkNewWalletModal,
  } = useDynamicContext() as any;
  const vendorWallet = useMemo(() => {
    if (primaryWallet) return primaryWallet;
    const list = wallets ?? [];
    // Prefer any EVM wallet in the list; fall back to the first wallet
    const evm = list.find(
      (w: any) => w?.chain === "EVM" || isEthereumWallet(w)
    );
    return evm || list[0];
  }, [primaryWallet, wallets]);
  console.log(
    "vendorWallet",
    vendorWallet,
    "wallets",
    wallets,
    "primary",
    primaryWallet,
    "isAuthenticated",
    isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) {
      // Not logged in yet → open auth
      if (typeof setShowLinkNewWalletModal === "function") {
        setShowLinkNewWalletModal(true);
      } else {
        setShowAuthFlow?.(true);
      }
      return;
    }
    // Logged in but no wallets linked → prompt wallet linking
    if (isAuthenticated && (!wallets || wallets.length === 0)) {
      if (typeof setShowLinkNewWalletModal === "function") {
        setShowLinkNewWalletModal(true);
      } else {
        setShowAuthFlow?.(true);
      }
    }
  }, [isAuthenticated, wallets, setShowAuthFlow, setShowLinkNewWalletModal]);

  const [token, setToken] = useState(process.env.NEXT_PUBLIC_USDC || "");
  const [isNative, setIsNative] = useState(false);
  const [milestones, setMilestones] = useState([
    { amount: "", description: "" },
  ]);
  const router = useRouter();

  if (!vendorWallet) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Vendor: Create Agreement Draft</h1>
        <p>
          You need to sign in and link an EVM wallet before creating a draft.
        </p>
        <button
          onClick={() =>
            typeof setShowLinkNewWalletModal === "function"
              ? setShowLinkNewWalletModal(true)
              : setShowAuthFlow?.(true)
          }
        >
          Sign in / Create Wallet
        </button>
      </main>
    );
  }

  function addRow() {
    console.log("Row added");

    setMilestones([...milestones, { amount: "", description: "" }]);
  }
  function update(i: number, k: "amount" | "description", v: string) {
    const m = milestones.slice();
    (m[i] as any)[k] = v;
    setMilestones(m);
  }

  async function onCreate() {
    if (!vendorWallet) {
      console.log(
        "No vendorWallet on create. isAuthenticated=",
        isAuthenticated,
        "wallets=",
        wallets
      );
      if (typeof setShowLinkNewWalletModal === "function") {
        setShowLinkNewWalletModal(true);
      } else {
        setShowAuthFlow?.(true);
      }
      return;
    }
    console.log("Draft");
    const draft = {
      vendor: vendorWallet?.address,
      token,
      isNative,
      milestones: milestones.map((m) => ({
        amount: BigInt(m.amount || "0"),
        description: m.description,
      })),
    };
    // For MVP store in localStorage; replace with API/DB later
    const id = crypto.randomUUID();
    const draftJson = JSON.stringify(draft, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v
    );
    localStorage.setItem(`draft:${id}`, draftJson);
    router.push(`/agreements/draft/${id}`);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Vendor: Create Agreement Draft</h1>
      <label>Token (USDC addr)</label>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ display: "block", width: "100%" }}
      />
      <label>
        <input
          type="checkbox"
          checked={isNative}
          onChange={(e) => setIsNative(e.target.checked)}
        />
        Use native currency instead of token
      </label>

      <h3>Milestones</h3>
      {milestones.map((m, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <input
            placeholder="amount (wei units for native / token decimals for ERC20)"
            value={m.amount}
            onChange={(e) => update(i, "amount", e.target.value)}
          />
          <input
            placeholder="description"
            value={m.description}
            onChange={(e) => update(i, "description", e.target.value)}
          />
        </div>
      ))}
      <button onClick={addRow}>+ Add milestone</button>

      <div style={{ marginTop: 16 }}>
        <button onClick={onCreate} disabled={!vendorWallet}>
          Create Draft
        </button>
      </div>
    </main>
  );
}
