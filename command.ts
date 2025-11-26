import {
  createErrorString,
  createFail,
  createSuccess,
  isSuccess,
  pipeAsync,
  Result,
} from '@joyautomation/dark-matter'

export const runCommand = async (
  ...args: ConstructorParameters<typeof Deno.Command>
): Promise<Result<string>> => {
  const cmd = new Deno.Command(...args)
  try {
    const result = await cmd.output()
    const textDecoder = new TextDecoder()
    if (result.stderr.length > 0) {
      return createFail(createErrorString(textDecoder.decode(result.stderr)))
    }
    return createSuccess(textDecoder.decode(result.stdout))
  } catch (error) {
    return createFail(createErrorString(error))
  }
}

export const runCommandAndProcessOutput = <T>(
  processor: (output: string) => T = (output: string) => output as T,
  ...args: ConstructorParameters<typeof Deno.Command>
) =>
  pipeAsync(runCommand(...args), (result) => {
    if (isSuccess(result)) {
      return createSuccess(processor(result.output))
    } else {
      return result
    }
  })
