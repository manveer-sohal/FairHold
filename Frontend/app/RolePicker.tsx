"use client";

import { useMemo, useState } from "react";
import {
  useIsLoggedIn,
  useDynamicContext,
  useUserUpdateRequest,
} from "@dynamic-labs/sdk-react-core";

export default function RolePicker() {
  const isLoggedIn = useIsLoggedIn();
  const { user } = useDynamicContext();
  const { updateUser } = useUserUpdateRequest();
  const [saving, setSaving] = useState(false);

  const hasRole = useMemo(() => {
    const r = (user?.metadata as any)?.role;
    return r === "customer" || r === "vendor" || r === "both";
  }, [user]);

  if (!isLoggedIn || hasRole) return null;

  async function chooseRole(role: "customer" | "vendor" | "both") {
    setSaving(true);
    try {
      await updateUser({ metadata: { role } });
    } finally {
      setSaving(false);
    }
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
      <h2>Pick your role</h2>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => chooseRole("customer")} disabled={saving}>
          Customer
        </button>
        <button onClick={() => chooseRole("vendor")} disabled={saving}>
          Vendor
        </button>
        <button onClick={() => chooseRole("both")} disabled={saving}>
          Both
        </button>
      </div>
    </section>
  );
}
