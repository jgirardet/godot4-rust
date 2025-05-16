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
  // let gpf = getGodotProjectFile();
  // let gpd = getGodotProjectDir(gpf);
  // const tscnFiles = listTscnFiles(gpf);
  // const tscn = await selectTscn(tscnFiles, gpd);
  // if (!tscn) {
  //   return;
  // }

  // let nodes = (await TscnParser.file(path.resolve(tscn))).parse().nodes;

  console.log(node)
  const nodePicked = (await selectNode(node)) ;
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
