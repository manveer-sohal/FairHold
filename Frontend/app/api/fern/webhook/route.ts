// app/api/fern/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  // Verify signature if Fern provides one (check docs for header & secret)
  // const signature = req.headers.get("fern-signature");
  // verifyHmac(raw, signature, process.env.FERN_WEBHOOK_SECRET)

  const event = JSON.parse(raw);
  // event.type might be "transaction.updated" | "transaction.succeeded" | ...
  // Upsert to your DB: txId, status, amounts, destinationAddress, userId
  // await db.onrampEvent.create({ data: { ... } });

  return NextResponse.json({ ok: true });
}
