// Types for `ip -j address` command output

/**
 * Represents an IP address configuration on a network interface.
 * 
 * Contains information about a single IP address assigned to an interface,
 * including its family (IPv4/IPv6), prefix length, scope, and lifetime settings.
 */
export interface IpAddressInfo {
  /** Address family: IPv4 (inet) or IPv6 (inet6) */
  family: "inet" | "inet6";
  /** The IP address */
  local: string;
  /** Prefix length (subnet mask in CIDR notation) */
  prefixlen: number;
  /** Address scope: host (loopback), link (link-local), site, or global */
  scope: "host" | "global" | "link" | "site";
  /** Broadcast address (IPv4 only) */
  broadcast?: string;
  /** Interface label */
  label?: string;
  /** Routing metric for this address */
  metric?: number;
  /** Whether the address was dynamically assigned */
  dynamic?: boolean;
  /** Manage temporary addresses flag (IPv6) */
  mngtmpaddr?: boolean;
  /** Do not add a route for the network prefix */
  noprefixroute?: boolean;
  /** Valid lifetime in seconds */
  valid_life_time: number;
  /** Preferred lifetime in seconds */
  preferred_life_time: number;
}

/**
 * Represents a network interface and its complete configuration.
 * 
 * Contains detailed information about a network interface including its name,
 * operational state, hardware address, MTU, and all assigned IP addresses.
 */
export interface IpInterface {
  /** Interface index number */
  ifindex: number;
  /** Interface name (e.g., "eth0", "lo") */
  ifname: string;
  /** Interface flags (e.g., ["UP", "BROADCAST", "RUNNING"]) */
  flags: string[];
  /** Maximum transmission unit in bytes */
  mtu: number;
  /** Queueing discipline (e.g., "noqueue", "fq_codel") */
  qdisc: string;
  /** Operational state of the interface */
  operstate: "UP" | "DOWN" | "UNKNOWN";
  /** Interface group name */
  group: string;
  /** Transmit queue length */
  txqlen: number;
  /** Link layer type (e.g., "loopback", "ether") */
  link_type: "loopback" | "ether" | string;
  /** Hardware (MAC) address */
  address: string;
  /** Broadcast address for the link layer */
  broadcast: string;
  /** Link index for virtual interfaces */
  link_index?: number;
  /** Link network namespace ID */
  link_netnsid?: number;
  /** List of IP addresses assigned to this interface */
  addr_info: IpAddressInfo[];
}

/**
 * An array of network interfaces returned by the `ip -j address` command.
 */
export type IpAddressList = IpInterface[];

/**
 * Type guard to validate if unknown data is a valid IpAddressList.
 * 
 * Checks that the data is an array where each element has the required properties
 * of an IpInterface with correct types.
 * 
 * @param data - The data to validate
 * @returns True if data is a valid IpAddressList, false otherwise
 * 
 * @example
 * ```ts
 * const data = JSON.parse(output);
 * if (isIpAddressList(data)) {
 *   // data is now typed as IpAddressList
 *   console.log(data[0].ifname);
 * }
 * ```
 */
export const isIpAddressList = (data: unknown): data is IpAddressList => {
  if (!Array.isArray(data)) return false;

  return data.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.ifindex === "number" &&
      typeof item.ifname === "string" &&
      Array.isArray(item.flags) &&
      typeof item.mtu === "number" &&
      typeof item.qdisc === "string" &&
      typeof item.operstate === "string" &&
      typeof item.group === "string" &&
      typeof item.txqlen === "number" &&
      typeof item.link_type === "string" &&
      typeof item.address === "string" &&
      typeof item.broadcast === "string" &&
      Array.isArray(item.addr_info)
    );
  });
};

/**
 * Type guard to validate if unknown data is a valid IpInterface.
 * 
 * Checks that the data is an object with all required IpInterface properties
 * and correct types.
 * 
 * @param data - The data to validate
 * @returns True if data is a valid IpInterface, false otherwise
 * 
 * @example
 * ```ts
 * if (isIpInterface(someData)) {
 *   // someData is now typed as IpInterface
 *   console.log(someData.ifname);
 * }
 * ```
 */
export const isIpInterface = (data: unknown): data is IpInterface => {
  if (typeof data !== "object" || data === null) return false;

  const item = data as Record<string, unknown>;
  return (
    typeof item.ifindex === "number" &&
    typeof item.ifname === "string" &&
    Array.isArray(item.flags) &&
    typeof item.mtu === "number" &&
    typeof item.qdisc === "string" &&
    typeof item.operstate === "string" &&
    typeof item.group === "string" &&
    typeof item.txqlen === "number" &&
    typeof item.link_type === "string" &&
    typeof item.address === "string" &&
    typeof item.broadcast === "string" &&
    Array.isArray(item.addr_info)
  );
};

// Types for `ip -j route` command output

/**
 * Represents a single routing table entry.
 * 
 * Contains information about a route including its destination, gateway,
 * network device, routing protocol, and optional metrics.
 */
export interface IpRoute {
  /** Destination network or "default" for default route */
  dst: string;
  /** Gateway IP address (if applicable) */
  gateway?: string;
  /** Network device/interface name */
  dev: string;
  /** Routing protocol that installed the route */
  protocol: "dhcp" | "kernel" | "boot" | "static" | "ra" | string;
  /** Route scope: link, host, global, or site */
  scope?: "link" | "host" | "global" | "site";
  /** Preferred source address for outgoing packets */
  prefsrc?: string;
  /** Route metric/priority (lower is preferred) */
  metric?: number;
  /** Route flags */
  flags: string[];
}

/**
 * An array of routing table entries returned by the `ip -j route` command.
 */
export type IpRouteList = IpRoute[];

/**
 * Type guard to validate if unknown data is a valid IpRouteList.
 * 
 * Checks that the data is an array where each element has the required properties
 * of an IpRoute with correct types.
 * 
 * @param data - The data to validate
 * @returns True if data is a valid IpRouteList, false otherwise
 * 
 * @example
 * ```ts
 * const data = JSON.parse(output);
 * if (isIpRouteList(data)) {
 *   // data is now typed as IpRouteList
 *   const defaultRoute = data.find(r => r.dst === "default");
 * }
 * ```
 */
export const isIpRouteList = (data: unknown): data is IpRouteList => {
  if (!Array.isArray(data)) return false;

  return data.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.dst === "string" &&
      typeof item.dev === "string" &&
      typeof item.protocol === "string" &&
      Array.isArray(item.flags)
    );
  });
};

/**
 * Type guard to validate if unknown data is a valid IpRoute.
 * 
 * Checks that the data is an object with all required IpRoute properties
 * and correct types.
 * 
 * @param data - The data to validate
 * @returns True if data is a valid IpRoute, false otherwise
 * 
 * @example
 * ```ts
 * if (isIpRoute(someData)) {
 *   // someData is now typed as IpRoute
 *   console.log(someData.dst);
 * }
 * ```
 */
export const isIpRoute = (data: unknown): data is IpRoute => {
  if (typeof data !== "object" || data === null) return false;

  const item = data as Record<string, unknown>;
  return (
    typeof item.dst === "string" &&
    typeof item.dev === "string" &&
    typeof item.protocol === "string" &&
    Array.isArray(item.flags)
  );
};
