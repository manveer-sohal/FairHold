"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DeployAgreementButton from "@/components/DeployAgreementButton";

export default function DraftView() {
  const { id } = useParams<{ id: string }>();
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem(`draft:${id}`);
    if (raw) setDraft(JSON.parse(raw));
  }, [id]);

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

      <DeployAgreementButton id={id as string} />
    </main>
  );
}
