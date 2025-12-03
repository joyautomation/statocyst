/**
 * Common chain names used in nftables.
 *
 * Standard netfilter chains plus Docker-specific chains.
 */
export const CHAINS = [
  "PREROUTING",
  "POSTROUTING",
  "INPUT",
  "OUTPUT",
  "FORWARD",
  "DOCKER",
  "DOCKER-USER",
] as const;

/** Union type of all common chain names */
export type Chain = typeof CHAINS[number];

/**
 * Network protocol types.
 *
 * Enum representing common network protocols used in nftables rules.
 */
export enum Protocol {
  /** All protocols */
  All = "all",
  /** Internet Control Message Protocol */
  Icmp = "icmp",
  /** Transmission Control Protocol */
  Tcp = "tcp",
  /** User Datagram Protocol */
  Udp = "udp",
}

/**
 * Address family types for nftables.
 *
 * Specifies which protocol family a table, chain, or rule applies to.
 */
export type NftFamily = "ip" | "ip6" | "inet" | "arp" | "bridge" | "netdev";

/**
 * Netfilter hook types.
 *
 * Defines the point in packet processing where a chain is attached.
 */
export type NftHook =
  | "prerouting"
  | "input"
  | "forward"
  | "output"
  | "postrouting"
  | "ingress"
  | "egress";

/**
 * Chain types in nftables.
 *
 * Determines what kind of operations a chain can perform.
 */
export type NftChainType = "filter" | "nat" | "route";

/**
 * Default policy for a chain.
 *
 * Determines what happens to packets that don't match any rules.
 */
export type NftPolicy = "accept" | "drop";

// ============================================================================
// Root structure
// ============================================================================

/**
 * Root structure for nftables JSON output.
 *
 * Contains an array of nftables entries (tables, chains, rules, etc.).
 */
export interface NftablesList {
  /** Array of nftables entries */
  nftables: NftablesEntry[];
}

/**
 * Type guard to validate if unknown data is a valid NftablesList.
 *
 * @param value - The value to check
 * @returns True if value is a valid NftablesList
 */
export const isNftablesList = (value: unknown): value is NftablesList => {
  return typeof value === "object" && value !== null && "nftables" in value &&
    Array.isArray((value as NftablesList).nftables);
};

// ============================================================================
// Top-level entry types
// ============================================================================

/**
 * Union type representing any nftables entry.
 *
 * An entry can be metadata, a table, chain, rule, set, map, or various
 * named objects like counters, quotas, helpers, etc.
 */
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

/**
 * Type guard to check if an entry is a rule entry.
 *
 * @param entry - The nftables entry to check
 * @returns True if the entry contains a rule
 */
export const isNftableEntryRule = (
  entry: NftablesEntry,
): entry is { rule: NftRule } => {
  return "rule" in entry && isNftRule(entry.rule);
};

/**
 * Type guard to validate if unknown data is a valid NftablesEntry.
 *
 * @param value - The value to check
 * @returns True if value is a valid NftablesEntry
 */
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

/**
 * Metadata information about the nftables version.
 *
 * Contains version information and JSON schema version.
 */
export interface NftMetainfo {
  /** nftables version string */
  version: string;
  /** Release name */
  release_name: string;
  /** JSON schema version number */
  json_schema_version: number;
}

/**
 * Type guard to validate if unknown data is a valid NftMetainfo.
 *
 * @param value - The value to check
 * @returns True if value is a valid NftMetainfo
 */
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

/**
 * Represents an nftables table.
 *
 * Tables are containers for chains, sets, and other objects.
 */
export interface NftTable {
  /** Address family */
  family: NftFamily;
  /** Table name */
  name: string;
  /** Unique handle identifier */
  handle: number;
}

/**
 * Type guard to validate if unknown data is a valid NftTable.
 *
 * @param value - The value to check
 * @returns True if value is a valid NftTable
 */
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

/**
 * Represents an nftables chain.
 *
 * Chains contain rules and can be base chains (attached to hooks) or
 * regular chains (used for jumps/gotos).
 */
export interface NftChain {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Chain name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Chain type (for base chains) */
  type?: NftChainType;
  /** Netfilter hook point (for base chains) */
  hook?: NftHook;
  /** Chain priority */
  prio?: number;
  /** Default policy for unmatched packets */
  policy?: NftPolicy;
  /** Device name (for netdev family) */
  dev?: string;
}

/**
 * Type guard to validate if unknown data is a valid NftChain.
 *
 * @param value - The value to check
 * @returns True if value is a valid NftChain
 */
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

/**
 * Represents an nftables rule.
 *
 * Rules contain expressions that match packets and perform actions.
 */
export interface NftRule {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Parent chain name */
  chain: string;
  /** Unique handle identifier */
  handle: number;
  /** Array of rule expressions (matches and actions) */
  expr: NftExpr[];
  /** Optional comment */
  comment?: string;
  /** Rule index in the chain */
  index?: number;
}

/**
 * Type guard to validate if unknown data is a valid NftRule.
 *
 * @param value - The value to check
 * @returns True if value is a valid NftRule
 */
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

/**
 * Union type representing any nftables rule expression.
 *
 * Expressions can be matches (conditions), actions (accept/drop/nat), or
 * other operations like logging, counting, etc.
 */
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

/**
 * Represents a match expression in a rule.
 *
 * Compares a packet field (left) against a value or set (right) using an operator.
 */
export interface NftMatch {
  /** Comparison operator */
  op: "==" | "!=" | "<" | ">" | "<=" | ">=" | "in";
  /** Left side of comparison (packet field) */
  left: NftMatchLeft;
  /** Right side of comparison (value to match) */
  right: NftMatchRight;
}

/**
 * Left side of a match expression.
 *
 * Can be a payload field, metadata, connection tracking info, or concatenation.
 */
export type NftMatchLeft =
  | { payload: NftPayloadMatch }
  | { meta: NftMetaMatch }
  | { ct: NftCtMatch }
  | { concat: NftMatchLeft[] };

/**
 * Right side of a match expression.
 *
 * Can be a literal value, array, set, range, or prefix.
 */
export type NftMatchRight =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | { set: (string | number)[] }
  | { range: [string | number, string | number] }
  | { prefix: { addr: string; len: number } };

/**
 * Matches a field from a packet payload.
 */
export interface NftPayloadMatch {
  /** Protocol name (e.g., "ip", "tcp", "udp") */
  protocol: string;
  /** Field name (e.g., "daddr", "sport", "dport") */
  field: string;
}

/**
 * Matches packet metadata.
 */
export interface NftMetaMatch {
  /** Metadata key (e.g., "iifname", "oifname", "protocol") */
  key: string;
}

/**
 * Matches connection tracking information.
 */
export interface NftCtMatch {
  /** Connection tracking key (e.g., "state", "status") */
  key: string;
  /** Address family */
  family?: NftFamily;
  /** Direction (original or reply) */
  dir?: "original" | "reply";
}

// ============================================================================
// Counter
// ============================================================================

/**
 * Packet and byte counter.
 */
export interface NftCounter {
  /** Number of packets */
  packets: number;
  /** Number of bytes */
  bytes: number;
}

// ============================================================================
// NAT expressions
// ============================================================================

/**
 * Destination NAT expression.
 *
 * Rewrites the destination address and/or port of packets.
 */
export interface NftDnat {
  /** New destination address */
  addr?: string;
  /** Address family */
  family?: NftFamily;
  /** New destination port */
  port?: number;
  /** NAT flags */
  flags?: string[];
}

/**
 * Source NAT expression.
 *
 * Rewrites the source address and/or port of packets.
 */
export interface NftSnat {
  /** New source address */
  addr?: string;
  /** Address family */
  family?: NftFamily;
  /** New source port */
  port?: number;
  /** NAT flags */
  flags?: string[];
}

/**
 * Masquerade expression.
 *
 * Special form of SNAT that uses the outgoing interface address.
 */
export interface NftMasquerade {
  /** Port to masquerade to */
  port?: number;
  /** Masquerade flags */
  flags?: string[];
}

/**
 * Redirect expression.
 *
 * Redirects packets to local machine.
 */
export interface NftRedirect {
  /** Port to redirect to */
  port?: number;
  /** Redirect flags */
  flags?: string[];
}

// ============================================================================
// Mangle expression
// ============================================================================

/**
 * Mangle expression.
 *
 * Modifies packet fields or metadata.
 */
export interface NftMangle {
  /** Field to modify */
  key: NftMangleKey;
  /** New value */
  value: string | number;
}

/**
 * Key for mangle expression.
 *
 * Specifies which field to modify.
 */
export type NftMangleKey =
  | { payload: NftPayloadMatch }
  | { meta: NftMetaMatch }
  | { ct: NftCtMatch };

// ============================================================================
// Reject expression
// ============================================================================

/**
 * Reject expression.
 *
 * Rejects packets and optionally sends a response.
 */
export interface NftReject {
  /** Type of reject response */
  type?: "tcp reset" | "icmp" | "icmpv6" | "icmpx";
  /** Reject expression */
  expr?: string;
}

// ============================================================================
// Log expression
// ============================================================================

/**
 * Log expression.
 *
 * Logs packets to syslog or netlink.
 */
export interface NftLog {
  /** Log message prefix */
  prefix?: string;
  /** Netlink group */
  group?: number;
  /** Snapshot length */
  snaplen?: number;
  /** Queue threshold */
  queue_threshold?: number;
  /** Log level */
  level?: string;
  /** Log flags */
  flags?: string[];
}

// ============================================================================
// Limit expression
// ============================================================================

/**
 * Limit expression.
 *
 * Rate-limits packet or byte matching.
 */
export interface NftLimit {
  /** Rate value */
  rate: number;
  /** Time unit (e.g., "second", "minute", "hour") */
  per: string;
  /** Burst size */
  burst?: number;
  /** Invert the match */
  inv?: boolean;
  /** Unit ("packets" or "bytes") */
  unit?: string;
}

// ============================================================================
// Quota expression
// ============================================================================

/**
 * Quota expression.
 *
 * Matches until a byte quota is exceeded.
 */
export interface NftQuota {
  /** Quota value */
  val: number;
  /** Value unit (e.g., "bytes", "kbytes", "mbytes") */
  val_unit: string;
  /** Bytes used */
  used?: number;
  /** Invert the match */
  inv?: boolean;
}

// ============================================================================
// Connection tracking (ct) expression
// ============================================================================

/**
 * Connection tracking expression.
 *
 * Accesses connection tracking information.
 */
export interface NftCt {
  /** Connection tracking key (e.g., "state", "status", "mark") */
  key: string;
  /** Address family */
  family?: NftFamily;
  /** Direction (original or reply) */
  dir?: "original" | "reply";
}

// ============================================================================
// Meta expression
// ============================================================================

/**
 * Meta expression.
 *
 * Accesses packet metadata.
 */
export interface NftMeta {
  /** Metadata key (e.g., "iifname", "oifname", "protocol") */
  key: string;
}

// ============================================================================
// Payload expression
// ============================================================================

/**
 * Payload expression.
 *
 * Accesses packet payload fields.
 */
export interface NftPayload {
  /** Protocol name (e.g., "ip", "tcp", "udp") */
  protocol: string;
  /** Field name (e.g., "daddr", "sport", "dport") */
  field: string;
}

// ============================================================================
// Set/Map expressions
// ============================================================================

/**
 * Set expression.
 *
 * Adds or updates elements in a set.
 */
export interface NftSetExpr {
  /** Operation type */
  op: "add" | "update";
  /** Element to add/update */
  elem: NftMatchLeft;
  /** Set name */
  set: string;
}

/**
 * Map expression.
 *
 * Looks up a key in a map and returns data.
 */
export interface NftMapExpr {
  /** Key to look up */
  key: NftMatchLeft;
  /** Data returned from map */
  data: NftMatchLeft;
}

/**
 * Verdict map expression.
 *
 * Looks up a key and performs a verdict action.
 */
export interface NftVmapExpr {
  /** Key to look up */
  key: NftMatchLeft;
  /** Verdict data */
  data: NftMatchLeft;
}

// ============================================================================
// Jump/Goto expressions
// ============================================================================

/**
 * Jump expression.
 *
 * Jumps to another chain (will return after processing).
 */
export interface NftJump {
  /** Target chain name */
  target: string;
}

/**
 * Goto expression.
 *
 * Goes to another chain (will not return).
 */
export interface NftGoto {
  /** Target chain name */
  target: string;
}

// ============================================================================
// Queue expression
// ============================================================================

/**
 * Queue expression.
 *
 * Queues packets to userspace.
 */
export interface NftQueue {
  /** Queue number */
  num?: number;
  /** Total number of queues */
  total?: number;
  /** Queue flags */
  flags?: string[];
}

// ============================================================================
// Dup/Fwd expressions
// ============================================================================

/**
 * Duplicate expression.
 *
 * Duplicates packets to another destination.
 */
export interface NftDup {
  /** Destination address */
  addr: string;
  /** Output device */
  dev?: string;
}

/**
 * Forward expression.
 *
 * Forwards packets to another device.
 */
export interface NftFwd {
  /** Output device */
  dev: string;
  /** Destination address */
  addr?: string;
  /** Address family */
  family?: NftFamily;
}

// ============================================================================
// Set/Map objects
// ============================================================================

/**
 * Set object.
 *
 * A named set that can store elements for matching.
 */
export interface NftSet {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Set name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Element type(s) */
  type: string | string[];
  /** Set policy */
  policy?: "performance" | "memory";
  /** Set flags (e.g., "constant", "interval", "timeout") */
  flags?: string[];
  /** Element timeout in seconds */
  timeout?: number;
  /** Garbage collection interval */
  gc_interval?: number;
  /** Maximum number of elements */
  size?: number;
  /** Set elements */
  elem?: NftSetElement[];
}

/**
 * Map object.
 *
 * A named map that associates keys with data values.
 */
export interface NftMap {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Map name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Key type(s) */
  type: string | string[];
  /** Data type */
  map: string;
  /** Map policy */
  policy?: "performance" | "memory";
  /** Map flags */
  flags?: string[];
  /** Element timeout in seconds */
  timeout?: number;
  /** Garbage collection interval */
  gc_interval?: number;
  /** Maximum number of elements */
  size?: number;
  /** Map elements */
  elem?: NftSetElement[];
}

/**
 * Set or map element.
 */
export interface NftSetElement {
  /** Element data */
  elem: {
    /** Element value */
    val: string | number;
    /** Element timeout */
    timeout?: number;
    /** Time until expiration */
    expires?: number;
    /** Element comment */
    comment?: string;
  };
}

/**
 * Element object for adding elements to sets/maps.
 */
export interface NftElement {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Set/map name */
  name: string;
  /** Elements to add */
  elem: NftSetElement[];
}

// ============================================================================
// Flowtable
// ============================================================================

/**
 * Flowtable object.
 *
 * Hardware offload for connection flows.
 */
export interface NftFlowtable {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Flowtable name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Hook point */
  hook: string;
  /** Priority */
  prio: number;
  /** Device(s) */
  dev: string | string[];
}

// ============================================================================
// Named objects
// ============================================================================

/**
 * Named counter object.
 *
 * A reusable counter that can be referenced by rules.
 */
export interface NftCounterObj {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Counter name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Packet count */
  packets: number;
  /** Byte count */
  bytes: number;
}

/**
 * Named quota object.
 *
 * A reusable quota that can be referenced by rules.
 */
export interface NftQuotaObj {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Quota name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Quota in bytes */
  bytes: number;
  /** Bytes used */
  used: number;
  /** Invert the match */
  inv?: boolean;
}

/**
 * Named limit object.
 *
 * A reusable rate limiter that can be referenced by rules.
 */
export interface NftLimitObj {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Limit name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Rate value */
  rate: number;
  /** Time unit */
  per: string;
  /** Burst size */
  burst?: number;
  /** Unit ("packets" or "bytes") */
  unit?: string;
  /** Invert the match */
  inv?: boolean;
}

/**
 * Connection tracking helper object.
 *
 * Configures connection tracking helpers for protocols like FTP, SIP, etc.
 */
export interface NftCtHelper {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Helper name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Helper type (e.g., "ftp", "sip") */
  type: string;
  /** Protocol (e.g., "tcp", "udp") */
  protocol: string;
  /** Layer 3 protocol */
  l3proto?: NftFamily;
}

/**
 * Connection tracking timeout object.
 *
 * Configures connection tracking timeouts.
 */
export interface NftCtTimeout {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Timeout policy name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Protocol */
  protocol: string;
  /** Connection state */
  state?: string;
  /** Timeout value in seconds */
  value?: number;
}

/**
 * Connection tracking expectation object.
 *
 * Configures connection tracking expectations for related connections.
 */
export interface NftCtExpectation {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Expectation name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Protocol */
  protocol: string;
  /** Destination port */
  dport: number;
  /** Timeout in seconds */
  timeout: number;
  /** Maximum number of expectations */
  size: number;
  /** Layer 3 protocol */
  l3proto?: NftFamily;
}

/**
 * SYN proxy object.
 *
 * Configures TCP SYN proxy to protect against SYN flood attacks.
 */
export interface NftSynproxy {
  /** Address family */
  family: NftFamily;
  /** Parent table name */
  table: string;
  /** Synproxy name */
  name: string;
  /** Unique handle identifier */
  handle: number;
  /** Maximum segment size */
  mss: number;
  /** Window scale factor */
  wscale: number;
  /** TCP options flags */
  flags?: string[];
}
