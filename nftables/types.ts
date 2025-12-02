// Chain names commonly used in nftables
export const CHAINS = [
  "PREROUTING",
  "POSTROUTING",
  "INPUT",
  "OUTPUT",
  "FORWARD",
  "DOCKER",
  "DOCKER-USER",
] as const;
export type Chain = typeof CHAINS[number];

// Protocol types
export enum Protocol {
  All = "all",
  Icmp = "icmp",
  Tcp = "tcp",
  Udp = "udp",
}

// Family types for nftables
export type NftFamily = "ip" | "ip6" | "inet" | "arp" | "bridge" | "netdev";

// Hook types
export type NftHook =
  | "prerouting"
  | "input"
  | "forward"
  | "output"
  | "postrouting"
  | "ingress"
  | "egress";

// Chain types
export type NftChainType = "filter" | "nat" | "route";

// Policy types
export type NftPolicy = "accept" | "drop";

// ============================================================================
// Root structure
// ============================================================================

export interface NftablesList {
  nftables: NftablesEntry[];
}

export const isNftablesList = (value: unknown): value is NftablesList => {
  return typeof value === "object" && value !== null && "nftables" in value &&
    Array.isArray((value as NftablesList).nftables);
};

// ============================================================================
// Top-level entry types
// ============================================================================

export type NftablesEntry =
  | { metainfo: NftMetainfo }
  | { table: NftTable }
  | { chain: NftChain }
  | { rule: NftRule }
  | { set: NftSet }
  | { map: NftMap }
  | { element: NftElement }
  | { flowtable: NftFlowtable }
  | { counter: NftCounterObj }
  | { quota: NftQuotaObj }
  | { ct_helper: NftCtHelper }
  | { limit: NftLimitObj }
  | { ct_timeout: NftCtTimeout }
  | { ct_expectation: NftCtExpectation }
  | { synproxy: NftSynproxy };

export const isNftableEntryRule = (
  entry: NftablesEntry,
): entry is { rule: NftRule } => {
  return "rule" in entry && isNftRule(entry.rule);
};

export const isNftablesEntry = (value: unknown): value is NftablesEntry => {
  return typeof value === "object" &&
    value !== null &&
    ("metainfo" in value || "table" in value || "chain" in value ||
      "rule" in value || "set" in value || "map" in value ||
      "element" in value || "flowtable" in value || "counter" in value ||
      "quota" in value || "ct_helper" in value || "limit" in value ||
      "ct_timeout" in value || "ct_expectation" in value ||
      "synproxy" in value);
};

// ============================================================================
// Metainfo
// ============================================================================

export interface NftMetainfo {
  version: string;
  release_name: string;
  json_schema_version: number;
}

export const isNftMetainfo = (value: unknown): value is NftMetainfo => {
  return typeof value === "object" &&
    value !== null &&
    "version" in value &&
    "release_name" in value &&
    "json_schema_version" in value;
};

// ============================================================================
// Table
// ============================================================================

export interface NftTable {
  family: NftFamily;
  name: string;
  handle: number;
}

export const isNftTable = (value: unknown): value is NftTable => {
  return typeof value === "object" &&
    value !== null &&
    "family" in value &&
    "name" in value &&
    "handle" in value;
};

// ============================================================================
// Chain
// ============================================================================

export interface NftChain {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  type?: NftChainType;
  hook?: NftHook;
  prio?: number;
  policy?: NftPolicy;
  dev?: string;
}

export const isNftChain = (value: unknown): value is NftChain => {
  return typeof value === "object" &&
    value !== null &&
    "family" in value &&
    "table" in value &&
    "name" in value &&
    "handle" in value;
};

// ============================================================================
// Rule
// ============================================================================

export interface NftRule {
  family: NftFamily;
  table: string;
  chain: string;
  handle: number;
  expr: NftExpr[];
  comment?: string;
  index?: number;
}

export const isNftRule = (value: unknown): value is NftRule => {
  return typeof value === "object" &&
    value !== null &&
    "family" in value &&
    "table" in value &&
    "chain" in value &&
    "handle" in value &&
    "expr" in value &&
    Array.isArray((value as NftRule).expr);
};

// ============================================================================
// Expression types
// ============================================================================

export type NftExpr =
  | { match: NftMatch }
  | { counter: NftCounter }
  | { mangle: NftMangle }
  | { dnat: NftDnat }
  | { snat: NftSnat }
  | { masquerade: NftMasquerade }
  | { redirect: NftRedirect }
  | { reject: NftReject }
  | { drop: null }
  | { accept: null }
  | { log: NftLog }
  | { limit: NftLimit }
  | { quota: NftQuota }
  | { ct: NftCt }
  | { meta: NftMeta }
  | { payload: NftPayload }
  | { set: NftSetExpr }
  | { map: NftMapExpr }
  | { vmap: NftVmapExpr }
  | { jump: NftJump }
  | { goto: NftGoto }
  | { return: null }
  | { queue: NftQueue }
  | { dup: NftDup }
  | { fwd: NftFwd }
  | { xt: null }
  | { notrack: null };

// ============================================================================
// Match expression
// ============================================================================

export interface NftMatch {
  op: "==" | "!=" | "<" | ">" | "<=" | ">=" | "in";
  left: NftMatchLeft;
  right: NftMatchRight;
}

export type NftMatchLeft =
  | { payload: NftPayloadMatch }
  | { meta: NftMetaMatch }
  | { ct: NftCtMatch }
  | { concat: NftMatchLeft[] };

export type NftMatchRight =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | { set: (string | number)[] }
  | { range: [string | number, string | number] }
  | { prefix: { addr: string; len: number } };

export interface NftPayloadMatch {
  protocol: string;
  field: string;
}

export interface NftMetaMatch {
  key: string;
}

export interface NftCtMatch {
  key: string;
  family?: NftFamily;
  dir?: "original" | "reply";
}

// ============================================================================
// Counter
// ============================================================================

export interface NftCounter {
  packets: number;
  bytes: number;
}

// ============================================================================
// NAT expressions
// ============================================================================

export interface NftDnat {
  addr?: string;
  family?: NftFamily;
  port?: number;
  flags?: string[];
}

export interface NftSnat {
  addr?: string;
  family?: NftFamily;
  port?: number;
  flags?: string[];
}

export interface NftMasquerade {
  port?: number;
  flags?: string[];
}

export interface NftRedirect {
  port?: number;
  flags?: string[];
}

// ============================================================================
// Mangle expression
// ============================================================================

export interface NftMangle {
  key: NftMangleKey;
  value: string | number;
}

export type NftMangleKey =
  | { payload: NftPayloadMatch }
  | { meta: NftMetaMatch }
  | { ct: NftCtMatch };

// ============================================================================
// Reject expression
// ============================================================================

export interface NftReject {
  type?: "tcp reset" | "icmp" | "icmpv6" | "icmpx";
  expr?: string;
}

// ============================================================================
// Log expression
// ============================================================================

export interface NftLog {
  prefix?: string;
  group?: number;
  snaplen?: number;
  queue_threshold?: number;
  level?: string;
  flags?: string[];
}

// ============================================================================
// Limit expression
// ============================================================================

export interface NftLimit {
  rate: number;
  per: string;
  burst?: number;
  inv?: boolean;
  unit?: string;
}

// ============================================================================
// Quota expression
// ============================================================================

export interface NftQuota {
  val: number;
  val_unit: string;
  used?: number;
  inv?: boolean;
}

// ============================================================================
// Connection tracking (ct) expression
// ============================================================================

export interface NftCt {
  key: string;
  family?: NftFamily;
  dir?: "original" | "reply";
}

// ============================================================================
// Meta expression
// ============================================================================

export interface NftMeta {
  key: string;
}

// ============================================================================
// Payload expression
// ============================================================================

export interface NftPayload {
  protocol: string;
  field: string;
}

// ============================================================================
// Set/Map expressions
// ============================================================================

export interface NftSetExpr {
  op: "add" | "update";
  elem: NftMatchLeft;
  set: string;
}

export interface NftMapExpr {
  key: NftMatchLeft;
  data: NftMatchLeft;
}

export interface NftVmapExpr {
  key: NftMatchLeft;
  data: NftMatchLeft;
}

// ============================================================================
// Jump/Goto expressions
// ============================================================================

export interface NftJump {
  target: string;
}

export interface NftGoto {
  target: string;
}

// ============================================================================
// Queue expression
// ============================================================================

export interface NftQueue {
  num?: number;
  total?: number;
  flags?: string[];
}

// ============================================================================
// Dup/Fwd expressions
// ============================================================================

export interface NftDup {
  addr: string;
  dev?: string;
}

export interface NftFwd {
  dev: string;
  addr?: string;
  family?: NftFamily;
}

// ============================================================================
// Set/Map objects
// ============================================================================

export interface NftSet {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  type: string | string[];
  policy?: "performance" | "memory";
  flags?: string[];
  timeout?: number;
  gc_interval?: number;
  size?: number;
  elem?: NftSetElement[];
}

export interface NftMap {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  type: string | string[];
  map: string;
  policy?: "performance" | "memory";
  flags?: string[];
  timeout?: number;
  gc_interval?: number;
  size?: number;
  elem?: NftSetElement[];
}

export interface NftSetElement {
  elem: {
    val: string | number;
    timeout?: number;
    expires?: number;
    comment?: string;
  };
}

export interface NftElement {
  family: NftFamily;
  table: string;
  name: string;
  elem: NftSetElement[];
}

// ============================================================================
// Flowtable
// ============================================================================

export interface NftFlowtable {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  hook: string;
  prio: number;
  dev: string | string[];
}

// ============================================================================
// Named objects
// ============================================================================

export interface NftCounterObj {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  packets: number;
  bytes: number;
}

export interface NftQuotaObj {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  bytes: number;
  used: number;
  inv?: boolean;
}

export interface NftLimitObj {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  rate: number;
  per: string;
  burst?: number;
  unit?: string;
  inv?: boolean;
}

export interface NftCtHelper {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  type: string;
  protocol: string;
  l3proto?: NftFamily;
}

export interface NftCtTimeout {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  protocol: string;
  state?: string;
  value?: number;
}

export interface NftCtExpectation {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  protocol: string;
  dport: number;
  timeout: number;
  size: number;
  l3proto?: NftFamily;
}

export interface NftSynproxy {
  family: NftFamily;
  table: string;
  name: string;
  handle: number;
  mss: number;
  wscale: number;
  flags?: string[];
}
