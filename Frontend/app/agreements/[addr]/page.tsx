"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { agreementAbi } from "/Users/manveersohal/FairHold/Frontend/lib/escrowAbi";
import {
  publicClient,
  walletClientFromDynamicWallet,
} from "/Users/manveersohal/FairHold/Frontend/lib/viem";
import { formatEther } from "viem";

export default function AgreementDetail() {
  const { addr } = useParams<{ addr: `0x${string}` }>();
  const { wallets } = useDynamicContext() as any;
  const customerWallet = useMemo(
    () => (wallets ?? []).find(isEthereumWallet),
    [wallets]
  );
  const vendorWallet = customerWallet; // demo: same browser; in prod Vendor would have their own login/session

  const [info, setInfo] = useState<any>(null);
  const [amount, setAmount] = useState(""); // for funding (token units or wei)

  async function load() {
    const [customer, vendor, token, isNative, milestones] = await Promise.all([
      publicClient.readContract({
        address: addr,
        abi: agreementAbi,
        functionName: "customer",
      }),
      publicClient.readContract({
        address: addr,
        abi: agreementAbi,
        functionName: "vendor",
      }),
      publicClient.readContract({
        address: addr,
        abi: agreementAbi,
        functionName: "token",
      }),
      publicClient.readContract({
        address: addr,
        abi: agreementAbi,
        functionName: "isNative",
      }),
      publicClient.readContract({
        address: addr,
        abi: agreementAbi,
        functionName: "getMilestones",
      }),
    ]);
    setInfo({ customer, vendor, token, isNative, milestones });
  }

  useEffect(() => {
    load();
  }, [addr]);

  async function fund() {
    if (!customerWallet) return;
    const wc = await walletClientFromDynamicWallet(customerWallet);

    if (info.isNative) {
      await wc.writeContract({
        address: addr,
        abi: agreementAbi,
        functionName: "fund",
        args: [BigInt(0)],
        value: BigInt(amount || "0"),
      });
    } else {
      // ERC20 approve then fund
      const erc20 = [
        {
          type: "function",
          name: "approve",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ type: "bool" }],
        },
      ] as const;

      await wc.writeContract({
        address: info.token,
        abi: erc20,
        functionName: "approve",
        args: [addr, BigInt(amount || "0")],
      });

      await wc.writeContract({
        address: addr,
        abi: agreementAbi,
        functionName: "fund",
        args: [BigInt(amount || "0")],
      });
    }
    await load();
  }

  async function release(i: number) {
    if (!customerWallet) return;
    const wc = await walletClientFromDynamicWallet(customerWallet);
    await wc.writeContract({
      address: addr,
      abi: agreementAbi,
      functionName: "releaseMilestone",
      args: [BigInt(i)],
    });
    await load();
  }

  async function withdraw() {
    if (!vendorWallet) return;
    const wc = await walletClientFromDynamicWallet(vendorWallet);
    await wc.writeContract({
      address: addr,
      abi: agreementAbi,
      functionName: "withdraw",
      args: [],
    });
    await load();
  }

  if (!info) return <main style={{ padding: 24 }}>Loading…</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Agreement</h1>
      <p>
        <b>Address:</b> {addr}
      </p>
      <p>
        <b>Customer:</b> {info.customer}
      </p>
      <p>
        <b>Vendor:</b> {info.vendor}
      </p>
      <p>
        <b>Token:</b> {info.isNative ? "NATIVE" : info.token}
      </p>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          border: "1px solid #eee",
          borderRadius: 8,
        }}
      >
        <h3>Fund</h3>
        <input
          placeholder="amount (wei / token units)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={fund} disabled={!customerWallet}>
          Fund
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Milestones</h3>
        <ol>
          {info.milestones.map((m: any, i: number) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <code>{m.amount.toString()}</code> — {m.description} —{" "}
              {m.released ? "RELEASED" : "PENDING"}
              {!m.released && (
                <button
                  onClick={() => release(i)}
                  style={{ marginLeft: 8 }}
                  disabled={!customerWallet}
                >
                  Release
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Vendor</h3>
        <button onClick={withdraw} disabled={!vendorWallet}>
          Withdraw Released Funds
        </button>
      </div>
    </main>
  );
}
