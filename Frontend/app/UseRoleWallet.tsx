"use client";

import {
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";

export default function useRoleWallet(role: "customer" | "vendor") {
  const { user } = useDynamicContext();
  const wallets = useUserWallets();
  const map = ((user?.metadata as any)?.walletMap ?? {}) as Record<
    string,
    string | undefined
  >;
  const targetId = map[role];

  const evmWallets = wallets?.filter(isEthereumWallet) ?? [];
  const wallet = evmWallets.find((w: any) => w.id === targetId) ?? null;

  return {
    wallet,
    aaAddress: wallet?.address ?? null,
    getEOA: async () => {
      const connector = wallet?.connector;
      if (!connector || !isZeroDevConnector(connector)) return null;
      const signer = connector.eoaConnector;
      return typeof signer?.getAddress === "function"
        ? await signer.getAddress()
        : null;
    },
  };
}
