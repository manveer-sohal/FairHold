import { createPublicClient, createWalletClient, http, custom } from "viem";
import { baseSepolia } from "viem/chains";
import type { Chain } from "viem";

// public RPC
export const publicClient = createPublicClient({
  chain: baseSepolia as Chain,
  transport: http(
    process.env.NEXT_PUBLIC_RPC_URL ?? "https://sepolia.base.org"
  ),
});

// Try to derive a viem wallet client from a Dynamic wallet (EIP-1193)
export async function walletClientFromDynamicWallet(wallet: any) {
  // many Dynamic connectors expose an EIP-1193 provider on connector/provider
  const eip1193 =
    wallet?.connector?.provider ??
    (await wallet?.connector?.getProvider?.()) ??
    (globalThis as any).ethereum;

  if (!eip1193) throw new Error("No EIP-1193 provider from Dynamic wallet");
  return createWalletClient({
    account: wallet?.address as `0x${string}`, // AA smart account address is fine for AA flows
    chain: baseSepolia as Chain,
    transport: custom(eip1193),
  });
}
