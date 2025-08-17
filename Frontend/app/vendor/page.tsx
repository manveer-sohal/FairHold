"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

export default function VendorDashboard() {
  const { user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();

  useEffect(() => {
    // kick back to home if not logged in
    if (!isLoggedIn) router.replace("/");
    // if logged in but role isn't vendor, bounce to correct place
    const role = (user as any)?.metadata?.role;
    if (isLoggedIn && role && role !== "vendor") {
      router.replace(role === "customer" ? "/customer" : "/");
    }
  }, [isLoggedIn, user, router]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Vendor Dashboard</h1>
      <p>Welcome! This is your vendor home.</p>
      {/* TODO: list accepted agreements, link to Create Agreement, etc. */}
    </main>
  );
}
