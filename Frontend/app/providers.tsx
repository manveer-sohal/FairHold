"use client";

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID!,
        walletConnectors: [
          EthereumWalletConnectors,
          ZeroDevSmartWalletConnectors, // <- required when AA=ZeroDev is enabled in dashboard
        ],
      }}
    >
      {children}
      {/* Floating login/connect button */}
      <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50 }}>
        <DynamicWidget />
      </div>
    </DynamicContextProvider>
  );
}
