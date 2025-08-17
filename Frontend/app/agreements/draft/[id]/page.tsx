"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import {
  publicClient,
  walletClientFromDynamicWallet,
} from "@/Frontend/lib/viem";
import { factoryAbi } from "@/Frontend/lib/escrowAbi";
import { decodeEventLog } from "viem";

export default function DraftView() {
  const { id } = useParams<{ id: string }>();
  const [draft, setDraft] = useState<any>(null);
  const { wallets } = useDynamicContext() as any;
  const customerWallet = useMemo(
    () => (wallets ?? []).find(isEthereumWallet),
    [wallets]
  );
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem(`draft:${id}`);
    if (raw) setDraft(JSON.parse(raw));
  }, [id]);

  async function acceptAndCreate() {
    if (!draft || !customerWallet) return;

    const wc = await walletClientFromDynamicWallet(customerWallet);
    const factory = process.env.NEXT_PUBLIC_FACTORY as `0x${string}`;

    // pack milestones as tuple(uint256,string,bool)[]
    const ms = draft.milestones.map((m: any) => [
      BigInt(m.amount),
      String(m.description),
      false,
    ]);

    const hash = await wc.writeContract({
      address: factory,
      abi: factoryAbi,
      functionName: "createAgreement",
      args: [draft.vendor, draft.token, Boolean(draft.isNative), ms],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const log = receipt.logs.find(
      (l) => l.address.toLowerCase() === factory.toLowerCase()
    );
    if (!log) throw new Error("No AgreementCreated log");

    const ev = decodeEventLog({
      abi: factoryAbi,
      data: log.data,
      topics: log.topics,
    });

    const agreementAddr = (ev.args as any).agreement as `0x${string}`;
    // Optionally clear draft or mark accepted
    router.push(`/agreements/${agreementAddr}`);
  }

  if (!draft) return <main style={{ padding: 24 }}>Loading…</main>;

  const total = draft.milestones.reduce(
    (a: number, m: any) => a + Number(m.amount),
    0
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>Review Agreement Draft</h1>
      <p>
        <b>Vendor:</b> {draft.vendor}
      </p>
      <p>
        <b>Token:</b> {draft.isNative ? "NATIVE" : draft.token}
      </p>
      <h3>Milestones</h3>
      <ul>
        {draft.milestones.map((m: any, i: number) => (
          <li key={i}>
            {m.amount} — {m.description}
          </li>
        ))}
      </ul>
      <p>
        <b>Total:</b> {total}
      </p>

      <button onClick={acceptAndCreate} disabled={!customerWallet}>
        Accept & Create Escrow
      </button>
    </main>
  );
}
