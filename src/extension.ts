import * as vscode from "vscode";
import { setGodotProjectCommand } from "./commands/setGodotProject";
import { GODOTPROJET_IS_SET_KEY, NAME } from "./constantes";
import { logger } from "./log";
import { createGdextensionCommand } from "./commands/createGdextension";
import { startNewExtensionCommand } from "./commands/startNewGodotExtension";
import { getGodotProjectFile } from "./godotProject";
import { GodotManager } from "./panel/godotManager";
import { registerGCommand } from "./vscodeUtils";

export function activate(context: vscode.ExtensionContext) {
  logger.info(`Extension${NAME} activating`);

  context.subscriptions.push(
    registerGCommand("setGodotProject", setGodotProjectCommand)
  );

  let godotProjectFile = getGodotProjectFile(); //throw if fails
  vscode.commands
    .executeCommand("setContext", GODOTPROJET_IS_SET_KEY, true)
    .then((_) => _activateAfterProjectSet(context, godotProjectFile)) // not if no godot project
    .then((_) => logger.info("Starting complete"));
}

export function deactivate() {
  logger.info("Extension deactivating ");
}

function _activateAfterProjectSet(
  context: vscode.ExtensionContext,
  godotProjectFile: string
) {
  new GodotManager(context, godotProjectFile);

  context.subscriptions.push(
    registerGCommand("createGdextension", createGdextensionCommand),
    registerGCommand("startNewGDExtensionProject", startNewExtensionCommand)
  );
}
