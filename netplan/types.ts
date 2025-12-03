// Types for `netplan get` command output

/**
 * Represents an Ethernet interface configuration in netplan.
 *
 * Contains settings for wired network interfaces including DHCP, static
 * addresses, routing, and interface parameters.
 */
export interface NetplanEthernet {
  /** DHCP client identifier type */
  "dhcp-identifier"?: "mac" | "duid";
  /** Enable DHCPv4 */
  dhcp4?: boolean;
  /** Enable DHCPv6 */
  dhcp6?: boolean;
  /** Static IP addresses or address configurations */
  addresses?: Array<string | {
    [address: string]: {
      /** Address label */
      label?: string;
      /** Address lifetime in seconds */
      lifetime?: number;
      /** Route metric for this address */
      "route-metric"?: number;
    };
  }>;
  /** IPv4 gateway address */
  gateway4?: string;
  /** IPv6 gateway address */
  gateway6?: string;
  /** DNS nameserver configuration */
  nameservers?: {
    /** List of DNS server addresses */
    addresses?: string[];
    /** DNS search domains */
    search?: string[];
  };
  /** Custom routing table entries */
  routes?: Array<{
    /** Destination network */
    to?: string;
    /** Gateway address */
    via?: string;
    /** Route metric/priority */
    metric?: number;
  }>;
  /** Routing policy rules */
  "routing-policy"?: Array<{
    /** Source address/network */
    from?: string;
    /** Destination address/network */
    to?: string;
    /** Routing table number */
    table?: number;
    /** Rule priority */
    priority?: number;
  }>;
  /** Maximum transmission unit in bytes */
  mtu?: number;
  /** Whether the interface is optional for boot */
  optional?: boolean;
  /** Accept router advertisements (IPv6) */
  "accept-ra"?: boolean;
  /** MAC address override */
  macaddress?: string;
  /** Link-local address configuration */
  "link-local"?: string[];
}

/**
 * Represents a WiFi interface configuration in netplan.
 *
 * Contains settings for wireless network interfaces including DHCP, static
 * addresses, access point configuration, and interface parameters.
 */
export interface NetplanWifi {
  /** DHCP client identifier type */
  "dhcp-identifier"?: "mac" | "duid";
  /** Enable DHCPv4 */
  dhcp4?: boolean;
  /** Enable DHCPv6 */
  dhcp6?: boolean;
  /** Static IP addresses or address configurations */
  addresses?: Array<string | {
    [address: string]: {
      /** Address label */
      label?: string;
      /** Address lifetime in seconds */
      lifetime?: number;
      /** Route metric for this address */
      "route-metric"?: number;
    };
  }>;
  /** IPv4 gateway address */
  gateway4?: string;
  /** IPv6 gateway address */
  gateway6?: string;
  /** DNS nameserver configuration */
  nameservers?: {
    /** List of DNS server addresses */
    addresses?: string[];
    /** DNS search domains */
    search?: string[];
  };
  /** WiFi access point configurations */
  "access-points"?: {
    [ssid: string]: {
      /** WiFi password/passphrase */
      password?: string;
      /** WiFi mode */
      mode?: "infrastructure" | "ap" | "adhoc";
      /** WiFi channel number */
      channel?: number;
      /** Access point BSSID (MAC address) */
      bssid?: string;
      /** Whether the network is hidden */
      hidden?: boolean;
    };
  };
  /** Maximum transmission unit in bytes */
  mtu?: number;
  /** Whether the interface is optional for boot */
  optional?: boolean;
  /** MAC address override */
  macaddress?: string;
}

/**
 * Represents a network bridge configuration in netplan.
 *
 * Contains settings for bridge interfaces that combine multiple network
 * interfaces into a single logical interface.
 */
export interface NetplanBridge {
  /** Enable DHCPv4 */
  dhcp4?: boolean;
  /** Enable DHCPv6 */
  dhcp6?: boolean;
  /** Static IP addresses or address configurations */
  addresses?: Array<string | {
    [address: string]: {
      /** Address label */
      label?: string;
      /** Address lifetime in seconds */
      lifetime?: number;
      /** Route metric for this address */
      "route-metric"?: number;
    };
  }>;
  /** IPv4 gateway address */
  gateway4?: string;
  /** IPv6 gateway address */
  gateway6?: string;
  /** List of interface names to include in the bridge */
  interfaces?: string[];
  /** Bridge-specific parameters */
  parameters?: {
    /** Forwarding delay in seconds */
    "forward-delay"?: number;
    /** Hello time in seconds */
    "hello-time"?: number;
    /** Maximum age in seconds */
    "max-age"?: number;
    /** Bridge priority */
    priority?: number;
    /** Enable Spanning Tree Protocol */
    "stp"?: boolean;
  };
}

/**
 * Represents a bonded interface configuration in netplan.
 *
 * Contains settings for bonded (aggregated) network interfaces that combine
 * multiple physical interfaces for redundancy or increased bandwidth.
 */
export interface NetplanBond {
  /** Enable DHCPv4 */
  dhcp4?: boolean;
  /** Enable DHCPv6 */
  dhcp6?: boolean;
  /** Static IP addresses or address configurations */
  addresses?: Array<string | {
    [address: string]: {
      /** Address label */
      label?: string;
      /** Address lifetime in seconds */
      lifetime?: number;
      /** Route metric for this address */
      "route-metric"?: number;
    };
  }>;
  /** IPv4 gateway address */
  gateway4?: string;
  /** IPv6 gateway address */
  gateway6?: string;
  /** List of interface names to include in the bond */
  interfaces?: string[];
  /** Bond-specific parameters */
  parameters?: {
    /** Bonding mode */
    mode?: "balance-rr" | "active-backup" | "balance-xor" | "broadcast" | "802.3ad" | "balance-tlb" | "balance-alb";
    /** LACP rate for 802.3ad mode */
    "lacp-rate"?: "slow" | "fast";
    /** MII link monitoring interval in milliseconds */
    "mii-monitor-interval"?: number;
    /** Transmit hash policy */
    "transmit-hash-policy"?: string;
  };
}

/**
 * Represents a VLAN interface configuration in netplan.
 *
 * Contains settings for VLAN (Virtual LAN) interfaces that create logical
 * network segments on top of physical interfaces.
 */
export interface NetplanVlan {
  /** VLAN ID (802.1Q tag) */
  id: number;
  /** Name of the underlying physical interface */
  link: string;
  /** Enable DHCPv4 */
  dhcp4?: boolean;
  /** Enable DHCPv6 */
  dhcp6?: boolean;
  /** Static IP addresses or address configurations */
  addresses?: Array<string | {
    [address: string]: {
      /** Address label */
      label?: string;
      /** Address lifetime in seconds */
      lifetime?: number;
      /** Route metric for this address */
      "route-metric"?: number;
    };
  }>;
  /** IPv4 gateway address */
  gateway4?: string;
  /** IPv6 gateway address */
  gateway6?: string;
}

/**
 * Represents the complete netplan configuration structure.
 *
 * This is the root configuration object returned by the `netplan get` command,
 * containing all network interface configurations organized by type.
 */
export interface NetplanConfig {
  /** Network configuration root */
  network: {
    /** Netplan configuration version (always 2) */
    version: 2;
    /** Network renderer backend */
    renderer?: "networkd" | "NetworkManager";
    /** Ethernet interface configurations */
    ethernets?: {
      [interfaceName: string]: NetplanEthernet;
    };
    /** WiFi interface configurations */
    wifis?: {
      [interfaceName: string]: NetplanWifi;
    };
    /** Bridge interface configurations */
    bridges?: {
      [bridgeName: string]: NetplanBridge;
    };
    /** Bond interface configurations */
    bonds?: {
      [bondName: string]: NetplanBond;
    };
    /** VLAN interface configurations */
    vlans?: {
      [vlanName: string]: NetplanVlan;
    };
  };
}

/**
 * Type guard to validate if unknown data is a valid NetplanConfig.
 *
 * Checks that the data has the required structure with a network object
 * containing version 2.
 *
 * @param data - The data to validate
 * @returns True if data is a valid NetplanConfig, false otherwise
 *
 * @example
 * ```ts
 * const data = YAML.parse(output);
 * if (isNetplanConfig(data)) {
 *   // data is now typed as NetplanConfig
 *   console.log(data.network.ethernets);
 * }
 * ```
 */
export const isNetplanConfig = (data: unknown): data is NetplanConfig => {
  if (typeof data !== "object" || data === null) return false;
  
  const config = data as Record<string, unknown>;
  if (typeof config.network !== "object" || config.network === null) return false;
  
  const network = config.network as Record<string, unknown>;
  return network.version === 2;
};
