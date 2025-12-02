import { runCommandAndProcessOutput } from "../command.ts";
import { createFail, Result, rpipeAsync } from "@joyautomation/dark-matter";
import {
  isNftableEntryRule,
  isNftRule,
  NftablesEntry,
  NftablesList,
  NftChain,
  NftExpr,
  NftRule,
} from "./types.ts";
import { createSuccess, isSuccess } from "@joyautomation/dark-matter";

// Helper function to compare two NftRule objects for equality
export const areRulesEqual = (rule1: NftRule, rule2: NftRule): boolean => {
  // Compare basic properties (ignore handle since it's a unique identifier)
  if (
    rule1.family !== rule2.family ||
    rule1.table !== rule2.table ||
    rule1.chain !== rule2.chain
  ) {
    return false;
  }

  // Filter out counter expressions since they change over time
  const filterCounters = (expr: NftExpr[]) =>
    expr.filter((e) => !("counter" in e));

  const expr1 = filterCounters(rule1.expr);
  const expr2 = filterCounters(rule2.expr);

  // Compare expressions array length (after filtering counters)
  if (expr1.length !== expr2.length) {
    return false;
  }

  // Compare each expression (excluding counters)
  return JSON.stringify(expr1) === JSON.stringify(expr2);
};

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
  family: string,
  table: string,
): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: ["nft", "-j", "add", "table", family, table],
  });

export const createNfTableChain = (
  family: string,
  table: string,
  chain: string,
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
    () => createNfTable("ip", "nat"),
    () =>
      createNfTableChain("ip", "nat", "PREROUTING", "nat", "prerouting", -100),
    () => createNfTableChain("ip", "nat", "INPUT", "nat", "input", 100),
    () => createNfTableChain("ip", "nat", "OUTPUT", "nat", "output", -100),
    () =>
      createNfTableChain("ip", "nat", "POSTROUTING", "nat", "postrouting", 100),
  );

export const createFilterNfTable = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNfTable("ip", "filter"),
    () => createNfTableChain("ip", "filter", "INPUT", "filter", "input", 0),
    () => createNfTableChain("ip", "filter", "FORWARD", "filter", "forward", 0),
    () => createNfTableChain("ip", "filter", "OUTPUT", "filter", "output", 0),
  );

export const createRule = (
  family: string,
  table: string,
  chain: string,
  rule: string,
): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: ["nft", "-j", "add", "rule", family, table, chain, rule],
  });

export const getRuleByHandle = (
  family: string,
  table: string,
  chain: string,
  handle: number,
): Promise<Result<NftRule>> =>
  rpipeAsync(
    () => getRulesFromChain(family, table, chain),
    (result) => {
      const rule = result.find((entry) => entry.handle === handle);
      if (!rule) {
        return createFail("Rule not found");
      }
      return createSuccess(rule);
    },
  );

export const getRuleFromChain = (
  family: string,
  table: string,
  chain: string,
  ruleEntry: NftRule,
): Promise<Result<NftRule>> =>
  rpipeAsync(
    () => getRulesFromChain(family, table, chain),
    (result) => {
      const rule = result.find((entry) => {
        return areRulesEqual(entry, ruleEntry);
      });
      if (rule) {
        return createSuccess(rule);
      }
      return createFail("Rule not found");
    },
  );

export const deleteRuleByHandle = (
  family: string,
  table: string,
  chain: string,
  handle: number,
): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: [
      "nft",
      "-j",
      "delete",
      "rule",
      family,
      table,
      chain,
      "handle",
      String(handle),
    ],
  });

export const deleteRuleFromChain = (
  family: string,
  table: string,
  chain: string,
  rule: NftRule,
): Promise<Result<void>> =>
  rpipeAsync(
    () => getRuleFromChain(family, table, chain, rule),
    (result) => deleteRuleByHandle(family, table, chain, result.handle),
  );

export const deleteAllMatchingRulesFromChain = (
  family: string,
  table: string,
  chain: string,
  rule: NftRule,
): Promise<Result<void>> =>
  rpipeAsync(
    () => getRulesFromChain(family, table, chain),
    async (result) => {
      const matchingRules = result.filter((entry) =>
        areRulesEqual(entry, rule)
      );

      if (matchingRules.length === 0) {
        return createFail("No matching rules found");
      }

      // Delete all matching rules in parallel (safe since handles don't change)
      const deleteResults = await Promise.all(
        matchingRules.map((entry) =>
          deleteRuleByHandle(family, table, chain, entry.handle)
        ),
      );

      // Check if any deletion failed
      const failed = deleteResults.find((r) => !isSuccess(r));
      if (failed) {
        return failed;
      }

      return createSuccess(void 0);
    },
  );

export const createDnatRule = (
  sourceAddr: string,
  destAddr: string,
  family = "ip",
  table = "nat",
  chain = "PREROUTING",
  comment?: string,
): Promise<Result<void>> =>
  createRule(
    family,
    table,
    chain,
    `ip daddr ${sourceAddr} counter dnat to ${destAddr}${
      comment ? ` # ${comment}` : ""
    }`,
  );

export const getDNatRuleFromChain = (
  family: string,
  table: string,
  chain: string,
  sourceAddr: string,
  destAddr: string,
): Promise<Result<NftRule | undefined>> =>
  rpipeAsync(
    () => getRulesFromChain(family, table, chain),
    (result) =>
      createSuccess(result.find((entry) => {
        let hasMatchingSource = false;
        let hasMatchingDnat = false;

        entry.expr.forEach((expr) => {
          // Check if this is a match expression for the source address
          if ("match" in expr) {
            const match = expr.match;
            // Check if it's matching on IP daddr and the right IP
            if (
              "payload" in match.left &&
              match.left.payload.protocol === "ip" &&
              match.left.payload.field === "daddr" &&
              match.right === sourceAddr
            ) {
              hasMatchingSource = true;
            }
          }

          // Check if this is a dnat expression with the dest address
          if ("dnat" in expr && expr.dnat?.addr === destAddr) {
            hasMatchingDnat = true;
          }
        });

        // Rule must have both matching source and dnat target
        return hasMatchingSource && hasMatchingDnat;
      })),
  );

export const createSnatRule = (
  sourceAddr: string,
  destAddr: string,
  family = "ip",
  table = "nat",
  chain = "POSTROUTING",
  comment?: string,
): Promise<Result<void>> =>
  createRule(
    family,
    table,
    chain,
    `ip saddr ${sourceAddr} counter snat to ${destAddr}${
      comment ? ` # ${comment}` : ""
    }`,
  );

export const createDoubleNatRule = (
  publicAddr: string,
  privateAddr: string,
  natAddr: string,
): Promise<Result<void>> =>
  rpipeAsync(
    () => createDnatRule(publicAddr, privateAddr),
    () => createSnatRule(privateAddr, natAddr),
  );

export const createMangleNfTable = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNfTable("ip", "mangle"),
    () =>
      createNfTableChain(
        "ip",
        "mangle",
        "PREROUTING",
        "filter",
        "prerouting",
        -150,
      ),
    () => createNfTableChain("ip", "mangle", "INPUT", "filter", "input", -150),
    () =>
      createNfTableChain("ip", "mangle", "FORWARD", "filter", "forward", -150),
    () =>
      createNfTableChain("ip", "mangle", "OUTPUT", "filter", "output", -150),
    () =>
      createNfTableChain(
        "ip",
        "mangle",
        "POSTROUTING",
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
      createSuccess(
        result.nftables.filter((entry) => isNftableEntryRule(entry)).map((
          entry,
        ) => entry.rule),
      ),
  );

export const getChain = (
  family: string,
  tableName: string,
  chainName: string,
): Promise<Result<NftablesList>> =>
  runCommandAndProcessOutput<NftablesList>(
    (output) => JSON.parse(output) as NftablesList,
    "sudo",
    { args: ["nft", "-j", "list", "chain", family, tableName, chainName] },
  );

export const getRulesFromChain = (
  family: string,
  tableName: string,
  chainName: string,
): Promise<Result<NftRule[]>> =>
  rpipeAsync(
    () => getChain(family, tableName, chainName),
    (result) => {
      return createSuccess(
        result.nftables.filter((entry) =>
          "rule" in entry && isNftableEntryRule(entry)
        ).map((entry) => entry.rule),
      );
    },
  );
