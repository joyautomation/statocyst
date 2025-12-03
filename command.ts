import {
  createErrorString,
  createFail,
  createSuccess,
  isSuccess,
  pipeAsync,
  Result,
} from "@joyautomation/dark-matter";

/**
 * Executes a Deno command and returns its output as a Result.
 *
 * Runs a command using Deno.Command and captures stdout/stderr. If stderr
 * contains any output or an error occurs, returns a Fail result. Otherwise,
 * returns a Success result with the stdout content as a string.
 *
 * @param args - Arguments to pass to the Deno.Command constructor (command name and options)
 * @returns A Promise resolving to a Result containing the command's stdout on success,
 *          or an error message on failure
 *
 * @example
 * ```ts
 * const result = await runCommand("echo", { args: ["hello"] });
 * if (isSuccess(result)) {
 *   console.log(result.output); // "hello\n"
 * }
 * ```
 */
export const runCommand = async (
  ...args: ConstructorParameters<typeof Deno.Command>
): Promise<Result<string>> => {
  const cmd = new Deno.Command(...args);
  try {
    const result = await cmd.output();
    const textDecoder = new TextDecoder();
    if (result.stderr.length > 0) {
      return createFail(createErrorString(textDecoder.decode(result.stderr)));
    }
    return createSuccess(textDecoder.decode(result.stdout));
  } catch (error) {
    return createFail(createErrorString(error));
  }
};

/**
 * Executes a Deno command and processes its output with a custom processor function.
 *
 * Runs a command using runCommand and, if successful, applies the provided processor
 * function to transform the stdout string into a custom type. This is useful for
 * parsing JSON output, extracting specific data, or any other transformation.
 *
 * @template T - The type of the processed output
 * @param processor - Function to transform the command's stdout string into type T.
 *                    Defaults to identity function that casts the string to T
 * @param args - Arguments to pass to the Deno.Command constructor (command name and options)
 * @returns A Promise resolving to a Result containing the processed output on success,
 *          or an error message on failure
 *
 * @example
 * ```ts
 * // Parse JSON output
 * const result = await runCommandAndProcessOutput(
 *   (output) => JSON.parse(output),
 *   "ip",
 *   { args: ["-j", "address"] }
 * );
 * if (isSuccess(result)) {
 *   console.log(result.output); // Parsed JSON object
 * }
 * ```
 */
export const runCommandAndProcessOutput = <T>(
  processor: (output: string) => T = (output: string) => output as T,
  ...args: ConstructorParameters<typeof Deno.Command>
): Promise<Result<T>> =>
  pipeAsync(runCommand(...args), (result) => {
    if (isSuccess(result)) {
      return createSuccess(processor(result.output));
    } else {
      return result;
    }
  });
