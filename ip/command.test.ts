import { getIpAddresses, getIpRoutes } from "./command.ts";
import { describe, it } from "@std/testing/bdd";
import { resultIsSuccessAndMatches } from "../testUtils.ts";
import { isIpAddressList, isIpRouteList } from "./types.ts";

describe("getIpAddresses", () => {
  it("should return an array of IP addresses", async () => {
    resultIsSuccessAndMatches(
      await getIpAddresses(),
      true,
      (result) => isIpAddressList(result.output),
    );
  });
  it("should return an array of IP routes", async () => {
    resultIsSuccessAndMatches(
      await getIpRoutes(),
      true,
      (result) => isIpRouteList(result.output),
    );
  });
});
