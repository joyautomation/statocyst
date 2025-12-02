import { runCommandAndProcessOutput } from "../command.ts";
import * as YAML from "@std/yaml";
import { NetplanConfig } from "./types.ts";

export const getNetplanConfig = () =>
  runCommandAndProcessOutput(
    (output) => YAML.parse(output),
    "sudo",
    {
      args: [
        "netplan",
        "-j",
        "get",
      ],
    },
  );
