import { describe, it } from "node:test";
import { getNetplanConfig } from "./command.ts";
import { isNetplanConfig } from "./types.ts";
import { resultIsSuccessAndMatches } from "../testUtils.ts";

describe("Netplan Command", () => {
  it("should return Netplan Config", async () => {
    resultIsSuccessAndMatches(
      await getNetplanConfig(),
      true,
      (result) => isNetplanConfig(result.output),
    );
  });
});
