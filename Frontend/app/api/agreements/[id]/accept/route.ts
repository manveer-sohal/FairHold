// app/api/agreements/[id]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "/Users/manveersohal/leasevault/lib/db";

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const ag = await db.agreement.update({
    where: { id: params.id },
    data: { status: "ACCEPTED" },
  });
  return NextResponse.json(ag);
}
//
