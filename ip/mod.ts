/**
 * @module
 *
 * IP address and routing management utilities.
 *
 * This module provides functions to query network interfaces, IP addresses,
 * and routing tables using the `ip` command from iproute2.
 *
 * @example
 * ```ts
 * import { getIpAddresses, getIpRoutes } from "@joyautomation/statocyst/ip";
 * import { isSuccess } from "@joyautomation/dark-matter";
 *
 * const result = await getIpAddresses();
 * if (isSuccess(result)) {
 *   console.log(result.output);
 * }
 * ```
 */

export * from "./types.ts";
export * from "./command.ts";
