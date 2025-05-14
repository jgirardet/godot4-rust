import { NAME } from "./constantes";
import { logger } from "./log";
import {
  CodeAction,
  CodeActionKind,
  commands,
  Disposable,
  Range,
  TextEditor,
  window,
  workspace,
  WorkspaceConfiguration,
} from "vscode";

export { getProjectConfig, getConfigValue, applyCodeActionNamed };

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

/// Apply the code titled at current cursor position
const applyCodeActionNamed = async (editor: TextEditor, title: string) => {
  const { document, selection } = editor;
  const range = selection.isEmpty
    ? new Range(selection.start, selection.start)
    : selection;

  const actions = await commands.executeCommand<CodeAction[]>(
    "executeCodeActionProvider",
    document.uri,
    range,
    CodeActionKind.QuickFix.value
  );

  if (actions?.length) {
    const action = actions.find((f) => f.title === title);
    if (action === undefined) {
      return;
    }
    if (action.edit) {
      await workspace.applyEdit(action.edit);
    }
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
