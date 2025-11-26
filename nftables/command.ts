import { runCommandAndProcessOutput } from "../command.ts";
import { Result, rpipeAsync } from "@joyautomation/dark-matter";
import { isNftRule, NftablesList, NftRule } from "./types.ts";
import { createSuccess, isSuccess } from "@joyautomation/dark-matter";

export const isNftInstalled = (): Promise<Result<boolean>> =>
  runCommandAndProcessOutput<boolean>((output) => output !== "", "which", {
    args: ["nft"],
  });

export const installNft = (): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: ["apt-get", "install", "nftables", "-y"],
    env: { DEBIAN_FRONTEND: "noninteractive" },
  });

export const installIfNftMissing = (): Promise<
  Result<{ performedInstall: boolean }>
> =>
  rpipeAsync(
    isNftInstalled,
    (result) =>
      !result
        ? installNft().then((result) => {
          return isSuccess(result)
            ? createSuccess({ performedInstall: true })
            : result;
        })
        : createSuccess({ performedInstall: false }),
  );

export const createNfTable = (
  table: string,
  family: string,
): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: ["nft", "-j", "add", "table", family, table],
  });

export const createNfTableChain = (
  chain: string,
  table: string,
  family: string,
  type: string,
  hook: string,
  priority: number,
): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: [
      "nft",
      "-j",
      "add",
      "chain",
      family,
      table,
      chain.toUpperCase(),
      `{ type ${type} hook ${hook} priority ${priority}; policy accept; }`,
    ],
  });

export const createNatNfTable = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNfTable("nat", "ip"),
    () =>
      createNfTableChain("PREROUTING", "nat", "ip", "nat", "prerouting", -100),
    () => createNfTableChain("INPUT", "nat", "ip", "nat", "input", 100),
    () => createNfTableChain("OUTPUT", "nat", "ip", "nat", "output", -100),
    () =>
      createNfTableChain("POSTROUTING", "nat", "ip", "nat", "postrouting", 100),
  );

export const createFilterNfTable = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNfTable("filter", "ip"),
    () => createNfTableChain("INPUT", "filter", "ip", "filter", "input", 0),
    () => createNfTableChain("FORWARD", "filter", "ip", "filter", "forward", 0),
    () => createNfTableChain("OUTPUT", "filter", "ip", "filter", "output", 0),
  );

export const createMangleNfTable = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNfTable("mangle", "ip"),
    () =>
      createNfTableChain(
        "PREROUTING",
        "mangle",
        "ip",
        "filter",
        "prerouting",
        -150,
      ),
    () => createNfTableChain("INPUT", "mangle", "ip", "filter", "input", -150),
    () =>
      createNfTableChain("FORWARD", "mangle", "ip", "filter", "forward", -150),
    () =>
      createNfTableChain("OUTPUT", "mangle", "ip", "filter", "output", -150),
    () =>
      createNfTableChain(
        "POSTROUTING",
        "mangle",
        "ip",
        "filter",
        "postrouting",
        -150,
      ),
  );

// Initialize nftables with standard iptables-like tables and chains
export const initializeStandardTables = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNatNfTable(),
    () => createFilterNfTable(),
    () => createMangleNfTable(),
  );

// Get all tables
export const getTables = (): Promise<Result<NftablesList>> =>
  runCommandAndProcessOutput<NftablesList>(
    (output) => JSON.parse(output) as NftablesList,
    "sudo",
    { args: ["nft", "-j", "list", "tables"] },
  );

// Get a specific table
export const getTable = (
  family: string,
  tableName: string,
): Promise<Result<NftablesList>> =>
  runCommandAndProcessOutput<NftablesList>(
    (output) => JSON.parse(output) as NftablesList,
    "sudo",
    { args: ["nft", "-j", "list", "table", family, tableName] },
  );

// Get all rules from all tables
export const getRules = (): Promise<Result<NftRule[]>> =>
  rpipeAsync(
    () => getTables(),
    (result) =>
      createSuccess(result.nftables.filter((entry) => isNftRule(entry))),
  );

// Get rules from a specific table
export const getRulesFromTable = (
  family: string,
  tableName: string,
): Promise<Result<NftRule[]>> =>
  rpipeAsync(
    () => getTable(family, tableName),
    (result) =>
      createSuccess(result.nftables.filter((entry) => isNftRule(entry))),
  );
