// app/api/agreements/vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.toLowerCase();
  if (!address)
    return NextResponse.json({ error: "address required" }, { status: 400 });

  const items = await db.agreement.findMany({
    where: { vendorAddress: address },
    orderBy: { createdAt: "desc" },
    include: { milestones: true },
  });
  return NextResponse.json(items);
}
