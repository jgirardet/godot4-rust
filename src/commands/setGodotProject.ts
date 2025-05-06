import * as vscode from "vscode";
import { DISPLAY_NAME, NAME } from "../constantes";
import { logger } from "../log";

export { setGodotProject };

const setGodotProject = async () => {
  const godotfilepath = await vscode.window.showOpenDialog({
    filters: { "Godot Project File": ["godot"] },
    openLabel: "Select .godot project file",
    canSelectFiles: true,
  });
  if (godotfilepath === undefined) {
    logger.info(": No project File selected");
    return;
  }
  vscode.workspace
    .getConfiguration(NAME)
    .update("godotProjectFilePath", godotfilepath[0].fsPath);
  logger.info(`Set Godot Project to: ${godotfilepath[0].fsPath}`);
};
