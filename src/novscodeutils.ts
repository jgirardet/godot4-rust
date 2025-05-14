import { readFileSync } from "fs";
import { readFile } from "fs/promises";

export const readUtf8Sync = (path: string): string => {
  return readFileSync(path, { encoding: "utf-8" });
};

export const readUtf8 = (path: string): Promise<string> => {
  return readFile(path, { encoding: "utf-8" });
};
