import { onready_snippet } from "../snippets";
import { logger } from "../log";
import { selectNode } from "../ui/select";
import { NodeItem } from "../panel/nodeItem";
import {
  CodeActionKind,
  Position,
  Selection,
  SnippetString,
  TextEditor,
  window,
} from "vscode";
import { GodotManager } from "../panel/godotManager";
import { isRustanalyzerActive, tryExecuteCodeAction } from "../rust/utils";

export async function insertOnReady(manager: GodotManager, nodeItem: NodeItem) {
  let nodePicked;
  let rootNode;
  if (nodeItem.isRoot) {
    nodePicked = await selectNode(nodeItem);
    if (!nodePicked) {
      return;
    }
    rootNode = nodeItem;
  } else {
    nodePicked = nodeItem;
    rootNode = nodeItem.rootNode;
  }

  logger.info(`Node selected: \"${nodePicked.name}\"`);

  if (!rootNode.isRustStruct) {
    throw new Error("Root Node must be Rust GodotClass");
  }
  let editor = window.activeTextEditor;
  if (!editor) {
    throw new Error("No editot opened");
  }

  let editorPath = editor.document.fileName;
  let rustModule = manager.rust.getByPath(editorPath);
  if (!rustModule) {
    throw new Error("Active editor file  is not a Godot Rust module");
  }
  if (rootNode.rustModule?.file !== editorPath) {
    throw new Error("Root node is not currently edited file");
  }

  if (rustModule.hasDefaultInit) {
    if (
      rustModule.fields.find(
        (f) => f.attribute("init")?.argValue("node") === nodePicked.fullPath
      )
    ) {
      throw new Error(`OnReadyAlready exists for ${nodePicked.name}`);
    }
    let onreadsnip = onready_snippet(nodePicked);
    let targetRow =
      rustModule.fields.at(rustModule.fields.length - 1)?.range.endPosition
        .row || rustModule.struct.range.endPosition.row - 1;
    if (!targetRow) {
      return;
    }

    let line = editor.document.lineAt(targetRow);
    let preSnippet = "\n";
    if (!line.text.endsWith(",")) {
      preSnippet = ",\n";
    }

    let target = line.range.end;

    editor.selections = [new Selection(target, target)];

    await editor.insertSnippet(
      new SnippetString(preSnippet + onreadsnip.join("\n"))
    );
    await editor.document.save();

    logger.info("OnReady snippet added");

    // auto import, try to find the type then execute
    setTimeout(() => {
      if (isRustanalyzerActive()) {
        let typeAddedSelection = findRustTypeInSnippet(
          editor,
          line.lineNumber + onreadsnip.length,
          nodePicked
        );
        if (typeAddedSelection) {
          tryExecuteCodeAction(
            typeAddedSelection,
            editorPath,
            CodeActionKind.QuickFix,
            `^Import \`.*${nodePicked.rustType}\`$`
          );
          logger.info(`"${nodePicked.rustType}" imported`);
        } else {
          logger.warn("Can't execute auto import");
        }
      } else {
        logger.warn("Rust Analyzer is not active, skipping autoimport");
      }
    });
  }
}

function findRustTypeInSnippet(
  editor: TextEditor,
  line: number,
  nodeItem: NodeItem
): Selection | undefined {
  let index =
    editor.document.lineAt(line).text.search(`${nodeItem.rustType}`) + 1;
  if (index) {
    let position = new Position(line, index);
    return new Selection(position, position);
  }
}
