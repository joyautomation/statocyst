import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  getRules,
  getTables,
  initializeStandardTables,
  installIfNftMissing,
  isNftInstalled,
} from "./command.ts";
import { isSuccess, Result, ResultSuccess } from "@joyautomation/dark-matter";
import { isNftablesList, isNftRule } from "./types.ts";

const resultIsSuccessAndMatches = <T>(
  result: Result<T>,
  expected: unknown,
  beforeCheck: (result: ResultSuccess<T>) => unknown = (result) =>
    result.output,
) => {
  expect(isSuccess(result)).toBe(true);
  if (isSuccess(result)) {
    expect(beforeCheck(result)).toBe(expected);
  }
};

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
    const result = await getTables();
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(isNftablesList(result.output)).toBe(true);
    }
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
});
