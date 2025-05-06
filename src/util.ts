import { readFileSync } from "fs";
import path from "path";

/// Non vscode utils

export const loadFileQueries = (dir: string, file: string) =>
  readFileSync(path.resolve("src", dir, "queries", file), {
    encoding: "utf-8",
  });
