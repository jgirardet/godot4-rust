import { readFileSync } from "fs";
import path from "path";

const buildExports = (file: string) =>
  readFileSync(path.resolve("src/rust/queries", file), {
    encoding: "utf-8",
  });

export const godotModuleQuery = buildExports("./godotModule.scm");
