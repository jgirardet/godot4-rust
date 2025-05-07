import * as vscode from "vscode";
import { onready_snippet } from "../snippets";
import { logger } from "../log";
import { selectNode, selectNodes, selectTscn } from "../ui/select";
import {
  getGodotProjectDir,
  getGodotProjectFile,
  listTscnFiles,
} from "../godotProject";
import { TscnParser } from "../tscn/parser";
import path from "path";
import { Node } from "../tscn/types";

export const insertOnready = async () => {
  let gpf = getGodotProjectFile()
  let gpd = getGodotProjectDir(gpf);
  const tscnFiles = listTscnFiles(gpf);
  const tscn = await selectTscn(tscnFiles, gpd);
  if (!tscn) {
    return;
  }

  let nodes = new TscnParser(path.resolve(tscn)).parse().nodes;

  const nodePicked = (await selectNode(nodes)) as Node | undefined;
  if (!nodePicked) {
    return;
  }
  logger.info(`Node selected: \"${nodePicked.parent?.value}\"`);
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
