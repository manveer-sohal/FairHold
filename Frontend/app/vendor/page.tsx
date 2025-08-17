"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

/** ──────────────────────────────────────────────────────────────
 * Utilities
 * ──────────────────────────────────────────────────────────────*/
const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`Request failed: ${r.status}`);
    return r.json();
  });

/** Try multiple shapes of Dynamic’s user object to extract an 0x address */
function useVendorAddress(user: any): `0x${string}` | null {
  return useMemo(() => {
    try {
      const as0x = (s: unknown) =>
        typeof s === "string" && s.startsWith("0x")
          ? (s as `0x${string}`)
          : null;

      const fromPrimary = as0x((user as any)?.primaryWallet?.address);
      if (fromPrimary) return fromPrimary;

      const fromWallets = as0x((user as any)?.wallets?.[0]?.address);
      if (fromWallets) return fromWallets;

      const vc = (user as any)?.verifiedCredentials?.find?.((c: any) => {
        const a = c?.address || c?.address?.value;
        return typeof a === "string" && a.startsWith("0x");
      });
      const fromVC = as0x(vc?.address || vc?.address?.value);
      if (fromVC) return fromVC;

      const fromMeta = as0x((user as any)?.metadata?.address);
      if (fromMeta) return fromMeta;

      return null;
    } catch {
      return null;
    }
  }, [user]);
}

/** ──────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────*/
type Milestone = {
  id?: string;
  amountWei: string; // stringified wei
  description: string;
  released?: boolean;
};

type AgreementRow = {
  id: string;
  title?: string;
  description?: string;
  vendorAddress: `0x${string}`;
  customerAddress: `0x${string}`;
  status: "DRAFT" | "ACCEPTED" | "DEPLOYED" | "CANCELLED";
  isAccepted?: boolean;
  deployedAddress?: `0x${string}`;
  createdAt?: string;
  milestones: Milestone[];
};

/** Simple badge */
function Badge({
  color,
  children,
}: {
  color: "blue" | "green" | "gray" | "red";
  children: React.ReactNode;
}) {
  const map: Record<typeof color, string> = {
    blue: "#2563eb",
    green: "#059669",
    gray: "#6b7280",
    red: "#dc2626",
  };
  return (
    <span
      style={{
        background: map[color],
        color: "#fff",
        fontSize: 12,
        padding: "2px 8px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** ──────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────*/
export default function VendorDashboard() {
  const router = useRouter();
  const { user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  // Auth/role guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/");
      return;
    }
    const role = (user as any)?.metadata?.role;
    if (role && role !== "vendor") {
      router.replace(role === "customer" ? "/customer" : "/");
    }
  }, [isLoggedIn, user, router]);

  const vendorAddress = useVendorAddress(user);
  const lower = vendorAddress?.toLowerCase();

  const { data, error, isLoading, mutate } = useSWR<AgreementRow[]>(
    lower ? `/api/agreements/vendor?address=${lower}` : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(
      (a) =>
        a.title?.toLowerCase().includes(s) ||
        a.description?.toLowerCase().includes(s) ||
        a.customerAddress.toLowerCase().includes(s) ||
        a.deployedAddress?.toLowerCase().includes(s)
    );
  }, [data, q]);

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      drafts: list.filter((a) => a.status === "DRAFT").length,
      accepted: list.filter((a) => a.status === "ACCEPTED").length,
      deployed: list.filter((a) => a.status === "DEPLOYED").length,
    };
  }, [data]);

  const onCreateAgreement = useCallback(() => {
    router.push("/agreements/new-vendor");
  }, [router]);

  const onFern = useCallback(() => {
    // TODO: wire Fern On-Ramp modal/call here
    alert("Fern on-ramp coming soon. (Placeholder)");
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            Vendor Dashboard
          </h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            {vendorAddress ? (
              <>
                Signed in as{" "}
                <span style={{ fontFamily: "monospace" }}>{vendorAddress}</span>
              </>
            ) : (
              "Connect an EVM wallet to continue."
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <button
            onClick={onFern}
            style={{
              padding: "10px 14px",
              background: "#0ea5e9",
              color: "#fff",
              border: "none",
              borderRadius: 8,
            }}
          >
            Fund with Card (Fern)
          </button>
          <button
            onClick={onCreateAgreement}
            style={{
              padding: "10px 14px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
            }}
          >
            Create Agreement
          </button>
          <button
            onClick={() => mutate()}
            style={{
              padding: "10px 14px",
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: 8,
            }}
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Address warning */}
      {!vendorAddress && (
        <div
          style={{
            padding: 12,
            background: "#FEF3C7",
            borderRadius: 8,
            color: "#92400E",
            marginBottom: 16,
          }}
        >
          No wallet address found on your session. Please connect a wallet in
          the header first.
        </div>
      )}

      {/* KPIs */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <KpiCard label="Total" value={counts.total} />
        <KpiCard label="Drafts" value={counts.drafts} />
        <KpiCard label="Accepted" value={counts.accepted} />
        <KpiCard label="Deployed" value={counts.deployed} />
      </section>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, customer, or contract…"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            outline: "none",
          }}
        />
      </div>

      {/* States */}
      {vendorAddress && isLoading && <p>Loading your agreements…</p>}

      {vendorAddress && error && (
        <div
          style={{
            padding: 12,
            background: "#FEE2E2",
            borderRadius: 8,
            color: "#991B1B",
          }}
        >
          Failed to load agreements: {(error as Error).message}
        </div>
      )}

      {/* Table */}
      {vendorAddress && !isLoading && !error && (
        <>
          {!filtered || filtered.length === 0 ? (
            <EmptyState onCreate={onCreateAgreement} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    <th style={th}>Title</th>
                    <th style={th}>Customer</th>
                    <th style={th}>Status</th>
                    <th style={th}>Milestones</th>
                    <th style={th}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const isAccepted =
                      a.status === "ACCEPTED" || !!a.isAccepted;
                    const isDeployed =
                      a.status === "DEPLOYED" && a.deployedAddress;
                    const href = isDeployed
                      ? `/agreements/${a.deployedAddress}`
                      : `/agreements/draft/${a.id}`;

                    const statusBadge = isDeployed ? (
                      <Badge color="green">Deployed</Badge>
                    ) : isAccepted ? (
                      <Badge color="blue">Accepted</Badge>
                    ) : a.status === "DRAFT" ? (
                      <Badge color="gray">Draft</Badge>
                    ) : (
                      <Badge color="red">{a.status}</Badge>
                    );

                    return (
                      <tr key={a.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                        <td style={td}>
                          <div style={{ fontWeight: 600 }}>
                            {a.title || "Untitled Agreement"}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>
                            {a.description}
                          </div>
                        </td>
                        <td style={td}>
                          <code style={{ fontSize: 12 }}>
                            {a.customerAddress}
                          </code>
                        </td>
                        <td style={td}>{statusBadge}</td>
                        <td style={td}>{a.milestones?.length ?? 0}</td>
                        <td style={td}>
                          <Link
                            href={href}
                            style={{
                              padding: "8px 12px",
                              background: "#10b981",
                              color: "#fff",
                              borderRadius: 6,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isDeployed ? "Open Contract" : "Open Draft"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}

/** ──────────────────────────────────────────────────────────────
 * Small pieces
 * ──────────────────────────────────────────────────────────────*/
function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        border: "1px dashed #e5e7eb",
        borderRadius: 8,
        padding: 24,
        background: "#fafafa",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
        No agreements yet
      </div>
      <p style={{ opacity: 0.8, marginBottom: 12 }}>
        Create your first agreement to start working with a customer.
      </p>
      <button
        onClick={onCreate}
        style={{
          padding: "10px 14px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
        }}
      >
        Create Agreement
      </button>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 8px" };
const td: React.CSSProperties = { padding: "12px 8px", verticalAlign: "top" };
