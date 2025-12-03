/**
 * @module
 *
 * nftables firewall management utilities.
 *
 * This module provides comprehensive functions to create, query, and manage
 * nftables firewall rules, tables, chains, and NAT configurations with full
 * type safety.
 *
 * @example
 * ```ts
 * import { createDnatRule, getRules } from "@joyautomation/statocyst/nftables";
 * import { isSuccess } from "@joyautomation/dark-matter";
 *
 * // Create a DNAT rule
 * await createDnatRule({
 *   table: "nat",
 *   chain: "PREROUTING",
 *   protocol: "tcp",
 *   dport: 80,
 *   to_addr: "192.168.1.100",
 *   to_port: 8080,
 * });
 *
 * // List all rules
 * const result = await getRules();
 * if (isSuccess(result)) {
 *   console.log(result.output);
 * }
 * ```
 */

export * from "./types.ts";
export * from "./command.ts";
