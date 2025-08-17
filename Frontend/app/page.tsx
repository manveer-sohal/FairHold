"use client";

import { useEffect } from "react";
import RolePicker from "./RolePicker";
import WalletMapper from "./WalletMapper";
import AddressesList from "./AddressesList";
import {
  useDynamicContext,
  useUserUpdateRequest,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";

type Role = "customer" | "vendor";
const getRole = (user: unknown): Role | null => {
  const meta = (user as { metadata?: Record<string, unknown> })?.metadata;
  const r = meta?.["role"];
  return r === "customer" || r === "vendor" ? (r as Role) : null;
};

export default function Page() {
  const { setShowAuthFlow, user } = useDynamicContext();
  const { updateUser } = useUserUpdateRequest();
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const role = getRole(user);

  useEffect(() => {
    if (isLoggedIn && role === "customer") {
      router.push("/customer");
    } else if (isLoggedIn && role === "vendor") {
      router.push("/vendor");
    }
  }, [isLoggedIn, role, router]);

  async function handleLogin() {
    setShowAuthFlow(true);
    if (role === "customer") {
      router.push("/customer");
    } else if (role === "vendor") {
      router.push("/vendor");
    }
  }

  async function handleAddWallet() {
    setShowAuthFlow(true);
  }

  async function handlePickRole() {
    // Clear role to re-open the RolePicker
    await updateUser({ metadata: { role: null } });
    router.push("/");
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Customer / Vendor Sign-in</h1>

      <RolePicker />
      <WalletMapper />
      <AddressesList />

      <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
        <button
          onClick={handleLogin}
          style={{
            padding: "10px 16px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 6,
          }}
        >
          Log In
        </button>
        <button
          onClick={handlePickRole}
          disabled={!isLoggedIn}
          style={{
            padding: "10px 16px",
            backgroundColor: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            opacity: !isLoggedIn ? 0.6 : 1,
          }}
        >
          Pick Role
        </button>
        <button
          onClick={handleAddWallet}
          disabled={!isLoggedIn}
          style={{
            padding: "10px 16px",
            backgroundColor: "#f59e0b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            opacity: !isLoggedIn ? 0.6 : 1,
          }}
        >
          Add Wallet
        </button>
      </div>
    </main>
  );
}
