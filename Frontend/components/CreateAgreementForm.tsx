// components/CreateAgreementForm.tsx
"use client";
import { useState } from "react";

export default function CreateAgreementForm({
  vendor,
  onCreated,
}: {
  vendor: string;
  onCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [customer, setCustomer] = useState("");
  const [milestones, setMilestones] = useState([
    { amountWei: "", description: "" },
  ]);

  const addMilestone = () =>
    setMilestones((ms) => [...ms, { amountWei: "", description: "" }]);

  return (
    <div className="space-y-3">
      {/* inputs… */}
      <button
        className="btn btn-primary"
        onClick={async () => {
          const res = await fetch("/api/agreements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              description: desc,
              vendorAddress: vendor,
              customerAddress: customer,
              milestones: milestones.map((m) => ({
                amountWei: m.amountWei,
                description: m.description,
              })),
            }),
          });
          const ag = await res.json();
          if (res.ok) onCreated(ag.id);
          else alert("Failed: " + JSON.stringify(ag));
        }}
      >
        Create
      </button>
      <button className="btn" onClick={addMilestone}>
        + Milestone
      </button>
    </div>
  );
}
