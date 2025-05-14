import { CodeAction, CodeActionKind, commands, Range, TextEditor, workspace } from "vscode";

/// Apply the code titled at current cursor position
export const applyCodeActionNamed = async (editor: TextEditor, title: string) => {
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