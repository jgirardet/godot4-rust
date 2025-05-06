import * as vscode from "vscode";
import { onready_snippet } from "../snippets";
import { logger } from "../log";
import { buildNodeTreeFromSingleTscn } from "../tscn/interact";

export { insertOnready };

const insertOnready = async () => {
  const res = await buildNodeTreeFromSingleTscn();
  if (res === undefined) {
    return;
  }

  // Pick node
  const pick = await vscode.window.showQuickPick(res.choices(), {
    title: `Nodes of ${res.root.name}`
  });
  if (pick === undefined) {
    return;
  }
  logger.info(`Node selected: \"${pick.node.path}\"`);
  let onreadsnip = onready_snippet(pick.node);

  if (
    !vscode.window.activeTextEditor?.document.lineAt(
      vscode.window.activeTextEditor.selection.active
    ).isEmptyOrWhitespace
  ) {
    await vscode.commands.executeCommand("editor.action.insertLineAfter");
  }

  vscode.window.activeTextEditor?.insertSnippet(
    new vscode.SnippetString(onreadsnip.join("\n"))
  );
};
