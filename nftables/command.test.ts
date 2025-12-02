import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  createRule,
  deleteAllMatchingRulesFromChain,
  getRuleFromChain,
  getRules,
  getRulesFromChain,
  getTables,
  initializeStandardTables,
  installIfNftMissing,
  isNftInstalled,
} from "./command.ts";
import { isSuccess, Result, ResultSuccess } from "@joyautomation/dark-matter";
import { isNftablesList, isNftRule, NftRule } from "./types.ts";
import { resultIsSuccessAndMatches } from "../testUtils.ts";

describe("NFT Tables Command", () => {
  it("should return true if nft is installed", async () => {
    resultIsSuccessAndMatches(await isNftInstalled(), true);
  });
  it("should install nftables if not installed.", async () => {
    resultIsSuccessAndMatches(
      await installIfNftMissing(),
      false,
      (result) => result.output.performedInstall,
    );
  });
  it("should initialize standard iptables-like tables", async () => {
    const result = await initializeStandardTables();
    expect(isSuccess(result)).toBe(true);
  });
  it("should return NFT Tables", async () => {
    resultIsSuccessAndMatches(
      await getTables(),
      true,
      (result) => isNftablesList(result.output),
    );
  });
  it("should return NFT Rules", async () => {
    const result = await getRules();
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      result.output.forEach((entry) => {
        expect(isNftRule(entry)).toBe(true);
      });
    }
  });
  let rule: NftRule;
  it("should create a rule", async () => {
    const result = await createRule(
      "ip",
      "nat",
      "PREROUTING",
      "ip daddr 127.0.0.1 counter dnat to 127.0.0.1",
    );
    expect(isSuccess(result)).toBe(true);
  });
  it("should get rule", async () => {
    const result = await getRuleFromChain(
      "ip",
      "nat",
      "PREROUTING",
      {
        family: "ip",
        table: "nat",
        chain: "PREROUTING",
        handle: 1,
        "expr": [{
          "match": {
            "op": "==",
            "left": { "payload": { "protocol": "ip", "field": "daddr" } },
            "right": "127.0.0.1",
          },
        }, { "dnat": { "addr": "127.0.0.1" } }],
      } as NftRule,
    );
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      rule = result.output;
    }
  });
  it("should delete all matching rules", async () => {
    const result = await deleteAllMatchingRulesFromChain(
      "ip",
      "nat",
      "PREROUTING",
      rule,
    );
    expect(isSuccess(result)).toBe(true);
    const rules = await getRulesFromChain("ip", "nat", "PREROUTING");
    expect(isSuccess(rules)).toBe(true);
    if (isSuccess(rules)) {
      expect(rules.output.length).toBe(0);
    }
  });
});
