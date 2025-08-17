// Frontend/lib/db.ts
// super-simple in-memory "DB" so server & client imports are local to Frontend

type Milestone = {
  id: string;
  amountWei: string;
  description: string;
  released?: boolean;
};

type Agreement = {
  id: string;
  title?: string;
  description?: string;
  vendorAddress: string;
  customerAddress: string;
  status: "DRAFT" | "ACCEPTED" | "DEPLOYED" | "CANCELLED";
  isAccepted?: boolean;
  deployedAddress?: `0x${string}`;
  createdAt?: Date;
  milestones: Milestone[];
};

// keep data across hot reloads
const g = globalThis as any;
if (!g.__FAIRHOLD_DB__) {
  g.__FAIRHOLD_DB__ = {
    agreements: [] as Agreement[],
    milestones: [] as Milestone[],
  };
}
const store = g.__FAIRHOLD_DB__;

function orderDesc<T extends { createdAt?: Date }>(arr: T[]) {
  return [...arr].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
  );
}

export const db = {
  agreement: {
    async findMany(opts: {
      where?: Partial<Pick<Agreement, "vendorAddress" | "customerAddress">>;
      orderBy?: { createdAt: "asc" | "desc" };
      include?: { milestones?: boolean };
    }) {
      let rows: Agreement[] = store.agreements;
      if (opts?.where?.vendorAddress) {
        const v = opts.where.vendorAddress.toLowerCase();
        rows = rows.filter(
          (a: Agreement) => a.vendorAddress.toLowerCase() === v
        );
      }
      if (opts?.where?.customerAddress) {
        const c = opts.where.customerAddress.toLowerCase();
        rows = rows.filter(
          (a: Agreement) => a.customerAddress.toLowerCase() === c
        );
      }
      if (opts?.orderBy?.createdAt === "desc") rows = orderDesc(rows);
      if (opts?.include?.milestones) return rows.map((a) => ({ ...a }));
      return rows.map((a) => ({ ...a, milestones: [] }));
    },

    async create(opts: {
      data: {
        title?: string;
        description?: string;
        vendorAddress: string;
        customerAddress: string;
        status: Agreement["status"];
        milestones?: { create: { amountWei: string; description: string }[] };
      };
      include?: { milestones?: boolean };
    }) {
      const id = `ag_${Math.random().toString(36).slice(2, 10)}`;
      const createdAt = new Date();
      const milestones: Milestone[] =
        opts.data.milestones?.create?.map((m, i) => ({
          id: `${id}_m${i}`,
          amountWei: m.amountWei,
          description: m.description,
          released: false,
        })) ?? [];

      const row: Agreement = {
        id,
        title: opts.data.title,
        description: opts.data.description,
        vendorAddress: opts.data.vendorAddress,
        customerAddress: opts.data.customerAddress,
        status: opts.data.status,
        createdAt,
        milestones,
      };
      store.agreements.push(row);
      return opts.include?.milestones ? row : { ...row, milestones: [] };
    },
  },
};
