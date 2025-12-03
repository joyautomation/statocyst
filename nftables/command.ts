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

/**
 * Compares two NftRule objects for equality.
 *
 * Compares rules based on family, table, chain, and expressions, while ignoring
 * the handle (unique identifier) and counter expressions (which change over time).
 *
 * @param rule1 - First rule to compare
 * @param rule2 - Second rule to compare
 * @returns True if the rules are functionally equivalent, false otherwise
 *
 * @example
 * ```ts
 * const rule1 = await getRuleByHandle("ip", "nat", "PREROUTING", 5);
 * const rule2 = await getRuleByHandle("ip", "nat", "PREROUTING", 6);
 * if (isSuccess(rule1) && isSuccess(rule2)) {
 *   const equal = areRulesEqual(rule1.output, rule2.output);
 * }
 * ```
 */
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

/**
 * Checks if nftables is installed on the system.
 *
 * Uses the `which` command to determine if the `nft` binary is available.
 *
 * @returns A Promise resolving to a Result containing true if nftables is installed,
 *          false otherwise
 *
 * @example
 * ```ts
 * const result = await isNftInstalled();
 * if (isSuccess(result) && result.output) {
 *   console.log("nftables is installed");
 * }
 * ```
 */
export const isNftInstalled = (): Promise<Result<boolean>> =>
  runCommandAndProcessOutput<boolean>((output) => output !== "", "which", {
    args: ["nft"],
  });

/**
 * Installs nftables using apt-get.
 *
 * Runs `sudo apt-get install nftables -y` with non-interactive mode.
 * Requires sudo privileges.
 *
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await installNft();
 * if (isSuccess(result)) {
 *   console.log("nftables installed successfully");
 * }
 * ```
 */
export const installNft = (): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: ["apt-get", "install", "nftables", "-y"],
    env: { DEBIAN_FRONTEND: "noninteractive" },
  });

/**
 * Checks if nftables is installed and installs it if missing.
 *
 * Convenience function that combines isNftInstalled and installNft.
 *
 * @returns A Promise resolving to a Result containing an object with performedInstall
 *          boolean indicating whether installation was performed
 *
 * @example
 * ```ts
 * const result = await installIfNftMissing();
 * if (isSuccess(result)) {
 *   console.log(`Installation performed: ${result.output.performedInstall}`);
 * }
 * ```
 */
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

/**
 * Creates a new nftables table.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name to create
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createNfTable("ip", "custom");
 * if (isSuccess(result)) {
 *   console.log("Table created");
 * }
 * ```
 */
export const createNfTable = (
  family: string,
  table: string,
): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: ["nft", "-j", "add", "table", family, table],
  });

/**
 * Creates a new chain in an nftables table.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name to create
 * @param type - Chain type (e.g., "filter", "nat", "route")
 * @param hook - Netfilter hook point (e.g., "prerouting", "input", "forward", "output", "postrouting")
 * @param priority - Chain priority (lower values are processed first)
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createNfTableChain(
 *   "ip", "filter", "INPUT", "filter", "input", 0
 * );
 * ```
 */
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

/**
 * Creates a standard NAT table with all standard chains.
 *
 * Creates the "nat" table with PREROUTING, INPUT, OUTPUT, and POSTROUTING chains.
 *
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createNatNfTable();
 * if (isSuccess(result)) {
 *   console.log("NAT table created");
 * }
 * ```
 */
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

/**
 * Creates a standard filter table with all standard chains.
 *
 * Creates the "filter" table with INPUT, FORWARD, and OUTPUT chains.
 *
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createFilterNfTable();
 * if (isSuccess(result)) {
 *   console.log("Filter table created");
 * }
 * ```
 */
export const createFilterNfTable = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNfTable("ip", "filter"),
    () => createNfTableChain("ip", "filter", "INPUT", "filter", "input", 0),
    () => createNfTableChain("ip", "filter", "FORWARD", "filter", "forward", 0),
    () => createNfTableChain("ip", "filter", "OUTPUT", "filter", "output", 0),
  );

/**
 * Creates a new rule in an nftables chain.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name to add the rule to
 * @param rule - Rule specification in nftables syntax
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createRule(
 *   "ip", "filter", "INPUT",
 *   "tcp dport 22 counter accept"
 * );
 * ```
 */
export const createRule = (
  family: string,
  table: string,
  chain: string,
  rule: string,
): Promise<Result<void>> =>
  runCommandAndProcessOutput<void>(undefined, "sudo", {
    args: ["nft", "-j", "add", "rule", family, table, chain, rule],
  });

/**
 * Retrieves a specific rule by its handle.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name containing the rule
 * @param handle - Unique handle identifier for the rule
 * @returns A Promise resolving to a Result containing the NftRule if found
 *
 * @example
 * ```ts
 * const result = await getRuleByHandle("ip", "nat", "PREROUTING", 5);
 * if (isSuccess(result)) {
 *   console.log(result.output);
 * }
 * ```
 */
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

/**
 * Finds a rule in a chain that matches the given rule specification.
 *
 * Uses areRulesEqual to find a matching rule, ignoring handles and counters.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name to search
 * @param ruleEntry - Rule specification to match against
 * @returns A Promise resolving to a Result containing the matching NftRule if found
 *
 * @example
 * ```ts
 * const targetRule = { family: "ip", table: "nat", chain: "PREROUTING", expr: [...] };
 * const result = await getRuleFromChain("ip", "nat", "PREROUTING", targetRule);
 * ```
 */
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

/**
 * Deletes a rule by its handle.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name containing the rule
 * @param handle - Unique handle identifier for the rule to delete
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await deleteRuleByHandle("ip", "nat", "PREROUTING", 5);
 * if (isSuccess(result)) {
 *   console.log("Rule deleted");
 * }
 * ```
 */
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

/**
 * Deletes a rule from a chain by matching its specification.
 *
 * Finds the rule using getRuleFromChain and deletes it by handle.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name containing the rule
 * @param rule - Rule specification to match and delete
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const targetRule = { family: "ip", table: "nat", chain: "PREROUTING", expr: [...] };
 * const result = await deleteRuleFromChain("ip", "nat", "PREROUTING", targetRule);
 * ```
 */
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

/**
 * Deletes all rules from a chain that match the given specification.
 *
 * Finds all matching rules and deletes them in parallel.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name containing the rules
 * @param rule - Rule specification to match and delete
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const targetRule = { family: "ip", table: "nat", chain: "PREROUTING", expr: [...] };
 * const result = await deleteAllMatchingRulesFromChain("ip", "nat", "PREROUTING", targetRule);
 * ```
 */
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

/**
 * Creates a Destination NAT (DNAT) rule.
 *
 * Redirects packets destined for sourceAddr to destAddr.
 *
 * @param sourceAddr - Source IP address to match
 * @param destAddr - Destination IP address to NAT to
 * @param family - Address family (default: "ip")
 * @param table - Table name (default: "nat")
 * @param chain - Chain name (default: "PREROUTING")
 * @param comment - Optional comment for the rule
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createDnatRule("192.168.1.100", "10.0.0.5", "ip", "nat", "PREROUTING", "Web server");
 * ```
 */
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

/**
 * Finds a DNAT rule in a chain by source and destination addresses.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param table - Table name containing the chain
 * @param chain - Chain name to search
 * @param sourceAddr - Source IP address to match
 * @param destAddr - Destination IP address to match
 * @returns A Promise resolving to a Result containing the NftRule if found, undefined otherwise
 *
 * @example
 * ```ts
 * const result = await getDNatRuleFromChain("ip", "nat", "PREROUTING", "192.168.1.100", "10.0.0.5");
 * ```
 */
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

/**
 * Creates a Source NAT (SNAT) rule.
 *
 * Changes the source address of packets from sourceAddr to destAddr.
 *
 * @param sourceAddr - Source IP address to match
 * @param destAddr - New source IP address to NAT to
 * @param family - Address family (default: "ip")
 * @param table - Table name (default: "nat")
 * @param chain - Chain name (default: "POSTROUTING")
 * @param comment - Optional comment for the rule
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createSnatRule("10.0.0.5", "192.168.1.1");
 * ```
 */
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

/**
 * Creates a double NAT rule (DNAT + SNAT).
 *
 * Combines DNAT and SNAT to redirect traffic from publicAddr to privateAddr
 * while changing the source to natAddr.
 *
 * @param publicAddr - Public IP address to match
 * @param privateAddr - Private IP address to NAT to
 * @param natAddr - NAT source address
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createDoubleNatRule("203.0.113.1", "10.0.0.5", "192.168.1.1");
 * ```
 */
export const createDoubleNatRule = (
  publicAddr: string,
  privateAddr: string,
  natAddr: string,
): Promise<Result<void>> =>
  rpipeAsync(
    () => createDnatRule(publicAddr, privateAddr),
    () => createSnatRule(privateAddr, natAddr),
  );

/**
 * Creates a standard mangle table with all standard chains.
 *
 * Creates the "mangle" table with PREROUTING, INPUT, FORWARD, OUTPUT, and POSTROUTING chains.
 *
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await createMangleNfTable();
 * if (isSuccess(result)) {
 *   console.log("Mangle table created");
 * }
 * ```
 */
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

/**
 * Initializes nftables with standard iptables-like tables and chains.
 *
 * Creates nat, filter, and mangle tables with all their standard chains.
 *
 * @returns A Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```ts
 * const result = await initializeStandardTables();
 * if (isSuccess(result)) {
 *   console.log("Standard tables initialized");
 * }
 * ```
 */
export const initializeStandardTables = (): Promise<Result<void>> =>
  rpipeAsync(
    () => createNatNfTable(),
    () => createFilterNfTable(),
    () => createMangleNfTable(),
  );

/**
 * Retrieves all nftables tables.
 *
 * @returns A Promise resolving to a Result containing the NftablesList
 *
 * @example
 * ```ts
 * const result = await getTables();
 * if (isSuccess(result)) {
 *   console.log(result.output.nftables);
 * }
 * ```
 */
export const getTables = (): Promise<Result<NftablesList>> =>
  runCommandAndProcessOutput<NftablesList>(
    (output) => JSON.parse(output) as NftablesList,
    "sudo",
    { args: ["nft", "-j", "list", "tables"] },
  );

/**
 * Retrieves a specific nftables table.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param tableName - Name of the table to retrieve
 * @returns A Promise resolving to a Result containing the NftablesList
 *
 * @example
 * ```ts
 * const result = await getTable("ip", "nat");
 * if (isSuccess(result)) {
 *   console.log(result.output.nftables);
 * }
 * ```
 */
export const getTable = (
  family: string,
  tableName: string,
): Promise<Result<NftablesList>> =>
  runCommandAndProcessOutput<NftablesList>(
    (output) => JSON.parse(output) as NftablesList,
    "sudo",
    { args: ["nft", "-j", "list", "table", family, tableName] },
  );

/**
 * Retrieves all rules from all nftables tables.
 *
 * @returns A Promise resolving to a Result containing an array of NftRule objects
 *
 * @example
 * ```ts
 * const result = await getRules();
 * if (isSuccess(result)) {
 *   console.log(`Total rules: ${result.output.length}`);
 * }
 * ```
 */
export const getRules = (): Promise<Result<NftRule[]>> =>
  rpipeAsync(
    () => getTables(),
    (result) =>
      createSuccess(result.nftables.filter((entry) => isNftRule(entry))),
  );

/**
 * Retrieves all rules from a specific table.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param tableName - Name of the table
 * @returns A Promise resolving to a Result containing an array of NftRule objects
 *
 * @example
 * ```ts
 * const result = await getRulesFromTable("ip", "nat");
 * if (isSuccess(result)) {
 *   console.log(result.output);
 * }
 * ```
 */
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

/**
 * Retrieves a specific chain from a table.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param tableName - Name of the table containing the chain
 * @param chainName - Name of the chain to retrieve
 * @returns A Promise resolving to a Result containing the NftablesList
 *
 * @example
 * ```ts
 * const result = await getChain("ip", "nat", "PREROUTING");
 * if (isSuccess(result)) {
 *   console.log(result.output.nftables);
 * }
 * ```
 */
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

/**
 * Retrieves all rules from a specific chain.
 *
 * @param family - Address family (e.g., "ip", "ip6", "inet")
 * @param tableName - Name of the table containing the chain
 * @param chainName - Name of the chain
 * @returns A Promise resolving to a Result containing an array of NftRule objects
 *
 * @example
 * ```ts
 * const result = await getRulesFromChain("ip", "nat", "PREROUTING");
 * if (isSuccess(result)) {
 *   result.output.forEach(rule => console.log(rule));
 * }
 * ```
 */
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
