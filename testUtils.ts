import { isSuccess, Result, ResultSuccess } from "@joyautomation/dark-matter";
import { expect } from "@std/expect/expect";

export const resultIsSuccessAndMatches = <T>(
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
