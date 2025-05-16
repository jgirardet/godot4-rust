import * as vscode from "vscode";
import { onready_snippet } from "../snippets";
import { logger } from "../log";
import { selectNode, selectNodes, selectTscn } from "../ui/select";
import {
  getGodotProjectDir,
  getGodotProjectFile,
  listTscnFiles,
} from "../godotProject";
import { TscnParser } from "../godot/parser";
import path from "path";
import { Node } from "../godot/types";
import { NodeItem } from "../panel/nodeItem";

export const insertOnready = async (node: NodeItem) => {
  let nodePicked;
  if (node.isRoot) {
    nodePicked = await selectNode(node);
    if (!nodePicked) {
      return;
    }
  } else {
    nodePicked = node;
  }
  logger.info(`Node selected: \"${nodePicked.name}\"`);
  let onreadsnip = onready_snippet(nodePicked);

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
