import * as vscode from "vscode";
import { insertOnready } from "./commands/insertOnready";
import { setGodotProjectCommand } from "./commands/setGodotProject";
import { GODOTPROJET_IS_SET_KEY, NAME } from "./constantes";
import { log_error, logger } from "./log";
import { newGodotClass } from "./commands/newGodotClass";
import { createGdextensionCommand } from "./commands/createGdextension";
import { startNewExtensionCommand } from "./commands/startNewGodotExtension";
import { getGodotProjectFile } from "./godotProject";
import GodotProvider from "./godot/watcher";
import { PanelProvider } from "./ui/panel";

export function activate(context: vscode.ExtensionContext) {
  logger.info(`Extension${NAME} activating`);

  const commandSetProject = vscode.commands.registerCommand(
    NAME + "." + "setGodotProject",
    () => log_error(setGodotProjectCommand)
  );
  context.subscriptions.push(commandSetProject);

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
  const godotProvider = new GodotProvider(context, godotProjectFile);
  godotProvider.start();
  const panelProvider = new PanelProvider(context);

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

  context.subscriptions.push(commandInsertOnReady);
  context.subscriptions.push(command_newGodotClass);
  context.subscriptions.push(commandCreateGdextension);
  context.subscriptions.push(commandstartNewGDExtension);
}
