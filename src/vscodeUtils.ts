import { Point, Range } from "tree-sitter";
import { NAME } from "./constantes";
import { logger } from "./log";
import {
  commands,
  Disposable,
  Position,
  window,
  workspace,
  WorkspaceConfiguration,
  Range as VsRange,
} from "vscode";

export const getProjectConfig = (): WorkspaceConfiguration => {
  return workspace.getConfiguration(NAME);
};

export function getConfigValue<T>(key: string): T {
  let v = getProjectConfig().get<T>(key);
  if (v === undefined) {
    throw new Error(`The config key ${key} is undefined`);
  } else if (v === null) {
    throw new Error(`The config key ${key} is not set`);
  } else {
    return v;
  }
}

export const registerGCommand = (
  commandName: string,
  command: (...args: any[]) => any
): Disposable => {
  return commands.registerCommand(
    NAME + "." + commandName,
    async (...args: any[]) => {
      try {
        await command(...args);
      } catch (e) {
        logger.error(e);
        window.showErrorMessage(`Godot 4 Rust Error: ${e}`);
      }
    }
  );
};

//
export function pointToPosition(point: Point): Position {
  return new Position(point.row, point.column);
}

export function rangeToVsRange(range: Range): VsRange {
  return new VsRange(
    pointToPosition(range.startPosition),
    pointToPosition(range.endPosition)
  );
}
