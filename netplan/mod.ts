/**
 * @module
 *
 * Netplan network configuration utilities.
 *
 * This module provides functions to read and parse netplan network configurations,
 * including ethernet, WiFi, bridge, bond, and VLAN interfaces.
 *
 * @example
 * ```ts
 * import { getNetplanConfig } from "@joyautomation/statocyst/netplan";
 * import { isSuccess } from "@joyautomation/dark-matter";
 *
 * const result = await getNetplanConfig();
 * if (isSuccess(result)) {
 *   console.log(result.output.network.ethernets);
 * }
 * ```
 */

export * from "./types.ts";
export * from "./command.ts";
