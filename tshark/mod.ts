/**
 * @module
 *
 * Network traffic capture and analysis utilities.
 *
 * This module provides functions to capture and analyze network packets using
 * tshark (Wireshark's command-line interface).
 *
 * @example
 * ```ts
 * import { capturePackets } from "@joyautomation/statocyst/tshark";
 * import { isSuccess } from "@joyautomation/dark-matter";
 *
 * const result = await capturePackets({
 *   interface: "eth0",
 *   count: 10,
 *   filter: "tcp port 80",
 * });
 *
 * if (isSuccess(result)) {
 *   console.log(result.output);
 * }
 * ```
 */

export * from "./types.ts";
export * from "./command.ts";
