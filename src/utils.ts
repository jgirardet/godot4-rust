import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { FullPathDir, FullPathFile } from "./types";

export const readUtf8Sync = (path: string): string => {
  return readFileSync(path, { encoding: "utf-8" });
};

export const readUtf8 = (path: string): Promise<string> => {
  return readFile(path, { encoding: "utf-8" });
};

export const getGodotProjectDir = (projectFile: FullPathFile): FullPathDir => {
  return path.dirname(projectFile);
};
