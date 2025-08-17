// Human-readable ABI strings with tuples can be picky across abitype versions.
// Use explicit JSON ABI objects to avoid `InvalidParameterError` on tuple[] params.

export const factoryAbi = [
  {
    type: "event",
    name: "AgreementCreated",
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "agreement",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "customer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vendor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "isNative", type: "bool" },
    ],
    anonymous: false,
  },
  {
    type: "function",
    name: "createAgreement",
    stateMutability: "nonpayable",
    inputs: [
      { internalType: "address", name: "vendor", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bool", name: "isNative", type: "bool" },
      {
        internalType: "struct Agreement.Milestone[]",
        name: "milestones",
        type: "tuple[]",
        components: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "bool", name: "released", type: "bool" },
        ],
      },
    ],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
] as const;

export const agreementAbi = [
  {
    type: "function",
    name: "customer",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
  {
    type: "function",
    name: "vendor",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
  {
    type: "function",
    name: "token",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
  {
    type: "function",
    name: "isNative",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getMilestones",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        internalType: "struct Agreement.Milestone[]",
        name: "",
        type: "tuple[]",
        components: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "bool", name: "released", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "fund",
    stateMutability: "payable",
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "releaseMilestone",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "event",
    name: "Funded",
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MilestoneReleased",
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;
