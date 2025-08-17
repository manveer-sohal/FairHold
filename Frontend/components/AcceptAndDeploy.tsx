// components/AcceptAndDeploy.tsx
"use client";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { useEffect } from "react";

const factoryAbi = parseAbi([
  "function createAgreement(address vendor,address customer,(uint256 amount,string description,bool released)[] milestones) returns (address)",
]);

export function AcceptAndDeploy({ agreement }: { agreement: any }) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { data: receipt } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (receipt?.contractAddress) {
      fetch(`/api/agreements/${agreement.id}/deployed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: receipt.contractAddress,
          chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
          factoryAddress: process.env.NEXT_PUBLIC_FACTORY,
        }),
      });
    }
  }, [receipt, agreement.id]);

  return (
    <button
      className="btn btn-primary"
      disabled={isPending}
      onClick={async () => {
        // 1) mark accepted in DB
        await fetch(`/api/agreements/${agreement.id}/accept`, {
          method: "POST",
        });

        // 2) customer triggers on-chain create
        const milestones = agreement.milestones.map((m: any) => ({
          amount: BigInt(m.amountWei), // from string
          description: m.description,
          released: false,
        }));
        await writeContract({
          address: process.env.NEXT_PUBLIC_FACTORY as `0x${string}`,
          abi: factoryAbi,
          functionName: "createAgreement",
          args: [
            agreement.vendorAddress,
            agreement.customerAddress,
            milestones,
          ],
        });
      }}
    >
      {isPending ? "Deploying..." : "Accept & Create Contract"}
    </button>
  );
}
