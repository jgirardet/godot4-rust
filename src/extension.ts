import * as vscode from "vscode";
import { insertOnready } from "./commands/insertOnready";
import { setGodotProject } from "./commands/setGodotProject";
import { NAME } from "./constantes";
import { log_error, logger } from "./log";
import { newGodotClass } from "./commands/newGodotClass";
import { createGdextensionCommand } from "./commands/createGdextension";
import { startNewExtensionCommand } from "./commands/startNewGodotExtension";

export function activate(context: vscode.ExtensionContext) {
  logger.info("Extension activating");

  const commandSetProject = vscode.commands.registerCommand(
    NAME + "." + "setGodotProject",
    () => log_error(setGodotProject)
  );

  const commandInsertOnReady = vscode.commands.registerCommand(
    NAME + "." + "insertOnReady",
    () => log_error(insertOnready)
  );

  const command_newGodotClass = vscode.commands.registerCommand(
    NAME + "." + "newGodotClass",
    () => log_error(newGodotClass)
  );

  const commandCreateGdextension = vscode.commands.registerCommand(
    NAME + "." + "createGdextension",
    () => log_error(createGdextensionCommand)
  );

  const commandstartNewGDExtension = vscode.commands.registerCommand(
    NAME + "." + "startNewGDExtensionProject",
    () => log_error(startNewExtensionCommand)
  );

  context.subscriptions.push(commandSetProject);
  context.subscriptions.push(commandInsertOnReady);
  context.subscriptions.push(command_newGodotClass);
  context.subscriptions.push(commandCreateGdextension);
  context.subscriptions.push(commandstartNewGDExtension);
}

export function deactivate() {
  logger.info("Extension deactivating ");
}
