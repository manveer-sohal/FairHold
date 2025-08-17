// app/api/agreements/route.ts (app router) OR pages/api/agreements.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "/Users/manveersohal/leasevault/lib/db";

const Milestone = z.object({
  amountWei: z.string().regex(/^\d+$/), // stringified wei
  description: z.string().min(1),
});
const CreateAgreement = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  vendorAddress: z.string().toLowerCase(),
  customerAddress: z.string().toLowerCase(),
  milestones: z.array(Milestone).min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateAgreement.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );

  const { title, description, vendorAddress, customerAddress, milestones } =
    parsed.data;
  const ag = await db.agreement.create({
    data: {
      title,
      description,
      vendorAddress,
      customerAddress,
      status: "DRAFT",
      milestones: {
        create: milestones.map((m) => ({
          amountWei: m.amountWei,
          description: m.description,
        })),
      },
    },
    include: { milestones: true },
  });

  return NextResponse.json(ag, { status: 201 });
}
