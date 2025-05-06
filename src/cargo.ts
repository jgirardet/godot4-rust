import { existsSync, readFileSync } from "fs";
import path from "path";
import * as vscode from "vscode";
import { logger } from "./log";
const toml = require("smol-toml");
import cp from "node:child_process";
import { CargoComandResult } from "./types";

// find Cargo.toml file => undefined if != 1
export const getCargoToml = async (): Promise<string | undefined> => {
  let cargo = await vscode.workspace.findFiles("Cargo.toml");
  if (cargo.length === 1) {
    return path.resolve(cargo[0].fsPath);
  }
};

export const getRustDir = async (cargoToml?: string): Promise<string> => {
  if (cargoToml !== undefined) {
    return path.resolve(path.dirname(cargoToml));
  }
  let cargo = await getCargoToml();
  if (cargo !== undefined) {
    return path.resolve(path.dirname(cargo));
  } else {
    let folders = vscode.workspace.workspaceFolders;
    if (folders !== undefined && folders.length > 0) {
      return folders.at(0)!.uri.path;
    } else {
      throw new Error("Can't find any Cargo.toml ? Is the workspace opened ?");
    }
  }
};

export const getRustSrcDir = async (cargoToml?: string): Promise<string> => {
  let rustDir = await getRustDir(cargoToml);
  if (existsSync(path.join(rustDir, "src/"))) {
    let joined = path.resolve(path.join(rustDir, "src/"));
    return joined;
  } else {
    return rustDir;
  }
};

export const getCrateName = (cargoPath: string): string => {
  let file = readFileSync(cargoPath).toString("utf-8");
  let content = toml.parse(file);
  let res = content.package?.name;
  logger.info(`crate name: ${res}`);
  if (res === undefined) {
    throw new Error(
      "There is a probleme with Cargo.toml, Can't find crate's name"
    );
  }
  return res;
};

// cargo command which avoid Error bubbling
export const runCargoCommand = (command: string): CargoComandResult => {
  try {
    const res = cp.execSync(`cargo ${command}`, {
      encoding: "utf-8",
      timeout: 2000,
    });
    return { ok: res };
  } catch (err: any) {
    return { error: err.toString() };
  }
};
