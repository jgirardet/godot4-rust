import * as vscode from "vscode";
import { DISPLAY_NAME, NAME } from "../constantes";
import { logger } from "../log";
import { FullPathFile } from "../types";

export const setGodotProjectCommand = async () => {
  let path = await selectGodotProject();
  if (path === undefined) {
    return;
  }
  vscode.workspace.getConfiguration(NAME).update("godotProjectFilePath", path);
  logger.info(`Set Godot Project to: ${path}`);
  logger.info("Reloading extensions");
  await vscode.commands.executeCommand("workbench.action.restartExtensionHost");
};

export const selectGodotProject = async (): Promise<
  FullPathFile | undefined
> => {
  const godotfilepath = await vscode.window.showOpenDialog({
    filters: { "Godot Project File": ["godot"] },
    openLabel: "Select .godot project file",
    canSelectFiles: true,
  });
  if (godotfilepath === undefined) {
    logger.info(": No project File selected");
    return;
  }
  return godotfilepath[0].path;
};
