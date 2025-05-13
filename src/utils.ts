import { NAME } from "./constantes";
import { log_error } from "./log";
import {
  CodeAction,
  CodeActionKind,
  commands,
  Disposable,
  Range,
  TextEditor,
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

// export function registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable;
export const registerGCommand = (
  commandName: string,
  command: (...args: any[]) => any,
  ...args: any[]
): Disposable => {
  return commands.registerCommand(NAME + "." + commandName, () => {
    log_error(command, ...args);
  });
};
