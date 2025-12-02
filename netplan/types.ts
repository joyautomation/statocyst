// Types for `netplan get` command output

export interface NetplanEthernet {
  "dhcp-identifier"?: "mac" | "duid";
  dhcp4?: boolean;
  dhcp6?: boolean;
  addresses?: Array<string | {
    [address: string]: {
      label?: string;
      lifetime?: number;
      "route-metric"?: number;
    };
  }>;
  gateway4?: string;
  gateway6?: string;
  nameservers?: {
    addresses?: string[];
    search?: string[];
  };
  routes?: Array<{
    to?: string;
    via?: string;
    metric?: number;
  }>;
  "routing-policy"?: Array<{
    from?: string;
    to?: string;
    table?: number;
    priority?: number;
  }>;
  mtu?: number;
  optional?: boolean;
  "accept-ra"?: boolean;
  macaddress?: string;
  "link-local"?: string[];
}

export interface NetplanWifi {
  "dhcp-identifier"?: "mac" | "duid";
  dhcp4?: boolean;
  dhcp6?: boolean;
  addresses?: Array<string | {
    [address: string]: {
      label?: string;
      lifetime?: number;
      "route-metric"?: number;
    };
  }>;
  gateway4?: string;
  gateway6?: string;
  nameservers?: {
    addresses?: string[];
    search?: string[];
  };
  "access-points"?: {
    [ssid: string]: {
      password?: string;
      mode?: "infrastructure" | "ap" | "adhoc";
      channel?: number;
      bssid?: string;
      hidden?: boolean;
    };
  };
  mtu?: number;
  optional?: boolean;
  macaddress?: string;
}

export interface NetplanBridge {
  dhcp4?: boolean;
  dhcp6?: boolean;
  addresses?: Array<string | {
    [address: string]: {
      label?: string;
      lifetime?: number;
      "route-metric"?: number;
    };
  }>;
  gateway4?: string;
  gateway6?: string;
  interfaces?: string[];
  parameters?: {
    "forward-delay"?: number;
    "hello-time"?: number;
    "max-age"?: number;
    priority?: number;
    "stp"?: boolean;
  };
}

export interface NetplanBond {
  dhcp4?: boolean;
  dhcp6?: boolean;
  addresses?: Array<string | {
    [address: string]: {
      label?: string;
      lifetime?: number;
      "route-metric"?: number;
    };
  }>;
  gateway4?: string;
  gateway6?: string;
  interfaces?: string[];
  parameters?: {
    mode?: "balance-rr" | "active-backup" | "balance-xor" | "broadcast" | "802.3ad" | "balance-tlb" | "balance-alb";
    "lacp-rate"?: "slow" | "fast";
    "mii-monitor-interval"?: number;
    "transmit-hash-policy"?: string;
  };
}

export interface NetplanVlan {
  id: number;
  link: string;
  dhcp4?: boolean;
  dhcp6?: boolean;
  addresses?: Array<string | {
    [address: string]: {
      label?: string;
      lifetime?: number;
      "route-metric"?: number;
    };
  }>;
  gateway4?: string;
  gateway6?: string;
}

export interface NetplanConfig {
  network: {
    version: 2;
    renderer?: "networkd" | "NetworkManager";
    ethernets?: {
      [interfaceName: string]: NetplanEthernet;
    };
    wifis?: {
      [interfaceName: string]: NetplanWifi;
    };
    bridges?: {
      [bridgeName: string]: NetplanBridge;
    };
    bonds?: {
      [bondName: string]: NetplanBond;
    };
    vlans?: {
      [vlanName: string]: NetplanVlan;
    };
  };
}

// Type guard to check if data is a valid NetplanConfig
export const isNetplanConfig = (data: unknown): data is NetplanConfig => {
  if (typeof data !== "object" || data === null) return false;
  
  const config = data as Record<string, unknown>;
  if (typeof config.network !== "object" || config.network === null) return false;
  
  const network = config.network as Record<string, unknown>;
  return network.version === 2;
};
