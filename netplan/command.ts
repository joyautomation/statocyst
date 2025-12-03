import { Result } from "@joyautomation/dark-matter";
import { runCommandAndProcessOutput } from "../command.ts";
import * as YAML from "@std/yaml";
import { NetplanConfig } from "./types.ts";

/**
 * Retrieves the current netplan configuration.
 *
 * Executes the `netplan get` command to retrieve the system's network
 * configuration and parses the YAML output.
 *
 * @returns A Promise resolving to a Result containing the parsed NetplanConfig
 *          object, or an error if the command fails
 *
 * @example
 * ```ts
 * const result = await getNetplanConfig();
 * if (isSuccess(result)) {
 *   console.log(result.output.network.ethernets);
 * }
 * ```
 */
export const getNetplanConfig = (): Promise<Result<NetplanConfig>> =>
  runCommandAndProcessOutput<NetplanConfig>(
    (output) => YAML.parse(output) as NetplanConfig,
    "sudo",
    {
      args: [
        "netplan",
        "-j",
        "get",
      ],
    },
  );
