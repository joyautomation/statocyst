/**
 * @module
 *
 * Statocyst - Network configuration and monitoring utilities for Linux systems.
 *
 * This is the main entrypoint that exports command execution utilities.
 * For specific functionality, import from the submodules:
 * - `@joyautomation/statocyst/ip` - IP address and routing management
 * - `@joyautomation/statocyst/netplan` - Netplan configuration
 * - `@joyautomation/statocyst/nftables` - nftables firewall management
 * - `@joyautomation/statocyst/tshark` - Network traffic capture
 *
 * @example
 * ```ts
 * import { runCommand } from "@joyautomation/statocyst";
 * import * as nftables from "@joyautomation/statocyst/nftables";
 * ```
 */

export * from "./command.ts";
