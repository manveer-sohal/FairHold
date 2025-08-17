// app/api/agreements/[id]/deployed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "/Users/manveersohal/FairHold/lib/db"; // adjust if your db file is elsewhere

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// Adjust the import path to match where your artifacts live
// In your tree: Frontend/contracts/artifacts/contracts/Agreement.sol/Agreement.json
import AgreementArtifact from "/Users/manveersohal/FairHold/contracts/artifacts/contracts/Agreement.sol/Agreement.json";

// Minimal shape of a milestone as it comes from the DB for typing the map() below
type DbMilestone = { amountWei: string; description: string };

// ---- Config guards ----
const RPC_URL = process.env.RPC_URL;
const PK = process.env.DEPLOYER_PRIVATE_KEY;

if (!RPC_URL) {
  console.warn("[/api/agreements/[id]/deployed] Missing RPC_URL");
}
if (!PK) {
  console.warn("[/api/agreements/[id]/deployed] Missing DEPLOYER_PRIVATE_KEY");
}

// ---- Zod for the URL param ----
const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function POST(_req: NextRequest, ctx: { params: { id: string } }) {
  try {
    // 1) Validate param
    const parsed = ParamsSchema.safeParse(ctx.params);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid id param" }, { status: 400 });
    }
    const id = parsed.data.id;

    // 2) Load draft from DB
    const agreement = await db.agreement.findUnique({
      where: { id },
      include: { milestones: true },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }
    if (agreement.status !== "DRAFT" && agreement.status !== "ACCEPTED") {
      return NextResponse.json(
        {
          error: `Agreement status must be DRAFT/ACCEPTED, got ${agreement.status}`,
        },
        { status: 400 }
      );
    }

    // 3) Compose constructor args
    // Adjust to your Agreement.sol constructor signature:
    // constructor(address _vendor, address _customer, Milestone[] memory _milestones)
    // where Milestone = { uint256 amount; string description; bool released; }
    const vendor = agreement.vendorAddress as `0x${string}`;
    const customer = agreement.customerAddress as `0x${string}`;

    // Convert DB strings -> BigInt for chain
    const milestones = agreement.milestones.map((m: DbMilestone) => ({
      amount: BigInt(m.amountWei), // stringified wei -> bigint
      description: m.description,
      released: false, // start false
    }));

    // 4) Boot viem clients
    if (!RPC_URL || !PK) {
      return NextResponse.json(
        { error: "Server is missing RPC_URL or DEPLOYER_PRIVATE_KEY" },
        { status: 500 }
      );
    }

    const account = privateKeyToAccount(PK as `0x${string}`);
    const transport = http(RPC_URL);

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport,
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport,
    });

    // 5) Deploy
    const { abi, bytecode } = AgreementArtifact as {
      abi: any;
      bytecode: `0x${string}`;
    };

    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [vendor, customer, milestones],
      account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      return NextResponse.json(
        { error: "Deployment succeeded but no contractAddress in receipt" },
        { status: 500 }
      );
    }

    const deployedAddress = receipt.contractAddress as `0x${string}`;

    // 6) Persist to DB
    const updated = await db.agreement.update({
      where: { id },
      data: {
        agreementAddress: deployedAddress,
        status: "DEPLOYED",
      },
      include: { milestones: true },
    });

    return NextResponse.json(
      { txHash: hash, agreement: updated },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[deploy agreement] error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
