// app/api/agreements/[id]/deployed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "/Users/manveersohal/leasevault/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { contractAddress, chainId, factoryAddress } = await req.json();
  if (!contractAddress)
    return NextResponse.json(
      { error: "contractAddress required" },
      { status: 400 }
    );

  const ag = await db.agreement.update({
    where: { id: params.id },
    data: { status: "DEPLOYED", contractAddress, chainId, factoryAddress },
  });
  return NextResponse.json(ag);
}
