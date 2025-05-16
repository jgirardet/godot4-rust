import { NAME } from "./constantes";
import { logger } from "./log";
import {
  commands,
  Disposable,
  window,
  workspace,
  WorkspaceConfiguration,
} from "vscode";

export { getProjectConfig, getConfigValue };

const getProjectConfig = (): WorkspaceConfiguration => {
  return workspace.getConfiguration(NAME);
};

const getConfigValue = (key: string): string => {
  let v = getProjectConfig().get<string>(key);
  if (v === undefined) {
    throw new Error(`The config key ${key} is undefined`);
  } else if (v === null) {
    throw new Error(`The config key ${key} is not set`);
  } else {
    return v;
  }
};

export const registerGCommand = (
  commandName: string,
  command: (...args: any[]) => any,
  ...args: any[]
): Disposable => {
  return commands.registerCommand(NAME + "." + commandName, async () => {
    try {
      await command(...args);
    } catch (e) {
      logger.error(e);
      window.showErrorMessage(`Godot 4 Rust Error: ${e}`);
    }
  });
};
