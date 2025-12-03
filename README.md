# Statocyst

Network configuration and monitoring utilities for Linux systems.

## Overview

Statocyst is a TypeScript/Deno library that provides type-safe wrappers around common Linux networking tools. It makes it easy to programmatically manage network configurations, firewall rules, and monitor network traffic.

## Features

- **IP Management** - Query network interfaces, addresses, and routing tables
- **Netplan Configuration** - Read and parse netplan network configurations
- **nftables Firewall** - Create, query, and manage nftables rules with full type safety
- **Traffic Monitoring** - Capture and analyze network packets with tshark
- **Type-Safe** - Comprehensive TypeScript types for all network objects
- **Result Types** - Uses Result types for explicit error handling

## Installation

```typescript
import * as statocyst from "jsr:@joyautomation/statocyst";
// Or import specific modules
import * as ip from "jsr:@joyautomation/statocyst/ip";
import * as nftables from "jsr:@joyautomation/statocyst/nftables";
import * as netplan from "jsr:@joyautomation/statocyst/netplan";
import * as tshark from "jsr:@joyautomation/statocyst/tshark";
```

## Usage

### IP Address Management

Query network interfaces and routing information:

```typescript
import { getIpAddresses, getIpRoutes } from "jsr:@joyautomation/statocyst/ip";
import { isSuccess } from "@joyautomation/dark-matter";

// Get all network interfaces
const interfacesResult = await getIpAddresses();
if (isSuccess(interfacesResult)) {
  const interfaces = interfacesResult.output;
  for (const iface of interfaces) {
    console.log(`${iface.ifname}: ${iface.operstate}`);
    for (const addr of iface.addr_info) {
      console.log(`  ${addr.family}: ${addr.local}/${addr.prefixlen}`);
    }
  }
}

// Get routing table
const routesResult = await getIpRoutes();
if (isSuccess(routesResult)) {
  const routes = routesResult.output;
  const defaultRoute = routes.find(r => r.dst === "default");
  console.log(`Default gateway: ${defaultRoute?.gateway}`);
}
```

### Netplan Configuration

Read and parse netplan network configurations:

```typescript
import { getNetplanConfig } from "jsr:@joyautomation/statocyst/netplan";
import { isSuccess } from "@joyautomation/dark-matter";

const configResult = await getNetplanConfig();
if (isSuccess(configResult)) {
  const config = configResult.output;
  console.log(`Renderer: ${config.network.renderer}`);
  
  // Access ethernet interfaces
  if (config.network.ethernets) {
    for (const [name, eth] of Object.entries(config.network.ethernets)) {
      console.log(`${name}: DHCP4=${eth.dhcp4}, addresses=${eth.addresses}`);
    }
  }
}
```

### nftables Firewall Management

Create and manage firewall rules with full type safety:

```typescript
import {
  createNatNfTable,
  createDnatRule,
  getRules,
  deleteRuleByHandle,
} from "jsr:@joyautomation/statocyst/nftables";
import { isSuccess } from "@joyautomation/dark-matter";

// Create a NAT table
await createNatNfTable("nat");

// Add a DNAT rule to forward port 80 to 8080
const ruleResult = await createDnatRule({
  table: "nat",
  chain: "PREROUTING",
  protocol: "tcp",
  dport: 80,
  to_addr: "192.168.1.100",
  to_port: 8080,
  comment: "Forward HTTP to internal server",
});

// List all rules
const rulesResult = await getRules();
if (isSuccess(rulesResult)) {
  for (const rule of rulesResult.output) {
    console.log(`${rule.table}/${rule.chain}: handle ${rule.handle}`);
  }
}

// Delete a rule by handle
await deleteRuleByHandle("nat", "PREROUTING", 42);
```

### Traffic Monitoring

Capture and analyze network packets:

```typescript
import { capturePackets } from "jsr:@joyautomation/statocyst/tshark";
import { isSuccess } from "@joyautomation/dark-matter";

// Capture 10 packets on eth0
const captureResult = await capturePackets({
  interface: "eth0",
  count: 10,
  filter: "tcp port 80",
});

if (isSuccess(captureResult)) {
  const packets = captureResult.output;
  for (const packet of packets) {
    console.log(`${packet.timestamp}: ${packet.source} -> ${packet.destination}`);
  }
}
```

## API Documentation

### Modules

- **`/ip`** - IP address and routing management
  - `getIpAddresses()` - Get all network interfaces and addresses
  - `getIpRoutes()` - Get the routing table

- **`/netplan`** - Netplan configuration management
  - `getNetplanConfig()` - Read netplan configuration

- **`/nftables`** - nftables firewall management
  - Table management: `createNfTable()`, `getTables()`, `getTable()`
  - Chain management: `createNfTableChain()`, `getChain()`
  - Rule management: `createRule()`, `getRules()`, `deleteRuleByHandle()`
  - NAT operations: `createDnatRule()`, `createSnatRule()`, `createDoubleNatRule()`
  - Utilities: `isNftInstalled()`, `installNft()`

- **`/tshark`** - Network traffic capture and analysis
  - `capturePackets()` - Capture network packets

- **`/command`** - Low-level command execution utilities
  - `runCommand()` - Execute shell commands with Result types
  - `runCommandAndProcessOutput()` - Execute and process command output

## Requirements

- **Deno** 2.0 or later
- **Linux** operating system
- **Root/sudo access** for most operations (nftables, netplan, packet capture)
- **System tools**:
  - `ip` (iproute2)
  - `nft` (nftables)
  - `netplan` (for netplan operations)
  - `tshark` (for packet capture)

## Development

```bash
# Run tests
deno test -A

# Check types
deno check mod.ts

# Lint code
deno lint

# Format code
deno fmt

# Generate documentation
deno doc --html --name="Statocyst" mod.ts
```

## License

GPL-3.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

https://github.com/joyautomation/statocyst
