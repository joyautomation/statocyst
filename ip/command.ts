import { Result } from "@joyautomation/dark-matter";
import { runCommandAndProcessOutput } from "../command.ts";
import { IpAddressList, IpRouteList } from "./types.ts";

/**
 * Retrieves all network interface addresses and their configuration.
 *
 * Executes the `ip -j address` command to get detailed information about all
 * network interfaces on the system, including IP addresses, MTU, operational
 * state, and other interface properties.
 *
 * @returns A promise that resolves to an array of network interfaces with their
 *          address information, or rejects if the command fails.
 *
 * @example
 * ```ts
 * const interfaces = await getIpAddresses();
 * console.log(interfaces[0].ifname); // e.g., "eth0"
 * console.log(interfaces[0].addr_info[0].local); // e.g., "192.168.1.100"
 * ```
 */
export const getIpAddresses = (): Promise<Result<IpAddressList>> =>
  runCommandAndProcessOutput<IpAddressList>(
    (output) => JSON.parse(output),
    "ip",
    {
      args: [
        "-j",
        "address",
      ],
    },
  );

/**
 * Retrieves the system's routing table.
 *
 * Executes the `ip -j route` command to get all routing entries, including
 * destinations, gateways, network devices, protocols, and routing metrics.
 *
 * @returns A promise that resolves to an array of route entries, or rejects
 *          if the command fails.
 *
 * @example
 * ```ts
 * const routes = await getIpRoutes();
 * const defaultRoute = routes.find(r => r.dst === "default");
 * console.log(defaultRoute?.gateway); // e.g., "192.168.1.1"
 * ```
 */
export const getIpRoutes = (): Promise<Result<IpRouteList>> =>
  runCommandAndProcessOutput<IpRouteList>(
    (output) => JSON.parse(output),
    "ip",
    {
      args: [
        "-j",
        "route",
      ],
    },
  );
