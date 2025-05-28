import {
  CodeAction,
  CodeActionKind,
  commands,
  extensions,
  Range,
  Selection,
  TextEditor,
  Uri,
  workspace,
} from "vscode";
import { FullPathFile } from "../types";

export async function tryExecuteCodeAction(
  selection: Selection,
  file: FullPathFile,
  kind: CodeActionKind,
  matcher: string
) {
  const actions = await commands.executeCommand<CodeAction[]>(
    "vscode.executeCodeActionProvider",
    Uri.file(file),
    selection,
    kind.value
  )!;
  for (const action of actions) {
    if (action.title.match(new RegExp(String.raw`${matcher}`))) {
      if (action.command) {
        await commands.executeCommand(
          action.command.command,
          ...(action.command.arguments || [])
        );
        return;
      } else if (action.edit) {
        await workspace.applyEdit(action.edit);
        return;
      }
    }
  }
}

export function isRustanalyzerActive(): boolean {
  return extensions.getExtension("rust-lang.rust-analyzer")?.isActive || false;
}
