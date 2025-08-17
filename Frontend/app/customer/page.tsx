"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

export default function CustomerDashboard() {
  const { user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
    const role = (user as any)?.metadata?.role;
    if (isLoggedIn && role && role !== "customer") {
      router.replace(role === "vendor" ? "/vendor" : "/");
    }
  }, [isLoggedIn, user, router]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Customer Dashboard</h1>
      <p>Welcome! This is your customer home.</p>
      {/* TODO: list vendor agreements assigned to this customer, Accept etc. */}
    </main>
  );
}
