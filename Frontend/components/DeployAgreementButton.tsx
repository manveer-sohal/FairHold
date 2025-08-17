"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { id: string };

export default function DeployAgreementButton({ id }: Props) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const res = await fetch(`/api/agreements/${id}/deployed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to deploy agreement");
      }

      // Show tx, refresh any server components that read from DB
      setTxHash(data.txHash);
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        onClick={onClick}
        disabled={loading}
        style={{
          padding: "10px 16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Deploying…" : "Deploy Agreement"}
      </button>

      {txHash && (
        <div style={{ fontSize: 14 }}>
          ✅ Submitted: <code>{txHash}</code>
        </div>
      )}
      {error && (
        <div style={{ color: "#ef4444", fontSize: 14 }}>⚠️ {error}</div>
      )}
    </div>
  );
}
