import * as vscode from "vscode";
import { setGodotProjectCommand } from "./commands/setGodotProject";
import { GODOTPROJET_IS_SET_KEY, NAME } from "./constantes";
import { logger } from "./log";
import { createGdextensionCommand } from "./commands/createGdextension";
import { startNewExtensionCommand } from "./commands/startNewGodotExtension";
import { getGodotProjectFile } from "./godotProject";
import { GodotManager } from "./panel/godotManager";
import { registerGCommand } from "./vscodeUtils";
import { setRACheckToBuild } from "./commands/setRustAnalyzer";

export async function activate(
  context: vscode.ExtensionContext
): Promise<GodotManager> {
  logger.info(`Extension${NAME} activating`);

  context.subscriptions.push(
    registerGCommand("setGodotProject", setGodotProjectCommand),
    registerGCommand(
      "startNewGDExtensionProject",
      async () => await startNewExtensionCommand(context)
    )
  );

  let godotProjectFile = getGodotProjectFile(); //throw if fails
  await vscode.commands.executeCommand(
    "setContext",
    GODOTPROJET_IS_SET_KEY,
    true
  );
  let manager = new GodotManager(context, godotProjectFile);

  context.subscriptions.push(
    registerGCommand("createGdextension", createGdextensionCommand),
    registerGCommand("setRACheckToBuild", async () =>
      setRACheckToBuild(context)
    )
  );

  logger.info("Starting complete");

  return manager;
}

export function deactivate() {
  logger.info("Extension deactivating ");
}
