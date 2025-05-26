import { onready_snippet } from "../snippets";
import { logger } from "../log";
import { selectNode } from "../ui/select";
import { NodeItem } from "../panel/nodeItem";
import { commands, SnippetString, window } from "vscode";

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
    !window.activeTextEditor?.document.lineAt(
      window.activeTextEditor.selection.active
    ).isEmptyOrWhitespace
  ) {
    await commands.executeCommand("editor.action.insertLineAfter");
  }

  window.activeTextEditor?.insertSnippet(
    new SnippetString(onreadsnip.join("\n"))
  );
};

// async function insertOnReady2(nodeItem: NodeItem, manager: GodotManager) {
//   let rootNode = nodeItem.rootNode;
//   let editorPath = window.activeTextEditor?.document.fileName;
//   if (!editorPath) {
//     throw new Error("No editor opened");
//   }
//   let rustModule = manager.rust.getByPath(editorPath);
//   if (!rustModule) {
//     throw new Error("Active not know as Godot Rust module");
//   }

//   // il faut parser fields pour les toper et les modifiers éventeielel
// }
