import * as vscode from "vscode";
import {
  classImports,
  declGodotClassEnd,
  declGodotClassStart,
  implVirtualMethodsEnd,
  implVirtualMethodsStart,
  node_methods,
  onready_snippet,
} from "../snippets";
import { logger } from "../log";
import path from "path";
import { toSnake } from "ts-case-convert";
import { getRustSrcDir } from "../cargo.js";
import { getGodotProjectDir, getGodotProjectFile } from "../godotProject";
import { selectNodes, selectTscn } from "../ui/select";
import { QuickPickItem } from "vscode";
import { NodeItem } from "../panel/nodeItem";
import { applyCodeActionNamed } from "../rust/utils";
import { GodotManager } from "../panel/godotManager";

export const newGodotClass = async (
  { treeData, rust }: GodotManager,
  nodeItem?: NodeItem
): Promise<NodeItem | undefined> => {
  if (nodeItem && !nodeItem.isRoot) {
    logger.warn("Only root nodes can be derived, aborting");
    return;
  }

  let persistFile = await vscode.window.showQuickPick(["Yes", "No"], {
    title: "Create new a new Rust module ?",
  });
  if (persistFile === undefined) {
    return;
  }

  let gpf = getGodotProjectFile();
  let gpd = getGodotProjectDir(gpf);
  let selectedTscn = nodeItem?.tscn?.toAbs(gpd);
  if (!selectedTscn) {
    const tscnFiles = [...treeData.data.keys()];
    selectedTscn = await selectTscn(tscnFiles, gpd);
    if (!selectedTscn) {
      return;
    }
    nodeItem = treeData.data.get(selectedTscn);
  }
  if (!nodeItem) {
    logger.error("No nodeItem found for new class, but should have...");
    logger.info(treeData.data);
    return;
  }

  const methods = buildMethodsList();
  const pickedMethod = await pickMethods(methods);
  if (pickedMethod === undefined) {
    logger.info("New Godot Class command: aborting");
    return;
  }
  const pickedOnready = await pickOnReady(nodeItem);
  if (pickedOnready === undefined) {
    logger.info("New Godot Class command: aborting");
    return;
  }

  const snippet = build_snippet(nodeItem, pickedMethod, pickedOnready);

  let editor: vscode.TextEditor | undefined;
  let newFile;
  if (persistFile === "Yes") {
    newFile = await persist(selectedTscn, snippet);
    if (!newFile) {
      return;
    }
    editor = await vscode.window.showTextDocument(newFile);
    const rustStruct = await rust.tryGodotClass(newFile);
    if (rustStruct) {
      nodeItem.rustModule = rustStruct;
      return nodeItem;
    }
  } else {
    editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
      return;
    }
    await editor.insertSnippet(new vscode.SnippetString(snippet));
  }
};

const prepicked = ["ready", "process"];

const buildMethodsList = (): NodeMethodQuickItem[] => {
  let methods = [];
  for (let [name, imp] of Object.entries(node_methods)) {
    methods.push(new NodeMethodQuickItem(name, imp, prepicked.includes(name)));
  }
  return methods;
};

const pickMethods = async (
  mets: NodeMethodQuickItem[]
): Promise<NodeMethodQuickItem[] | undefined> => {
  let choices = await vscode.window.showQuickPick(mets, {
    canPickMany: true,
    title: "Select method to add to class",
  });
  return choices;
};

const pickOnReady = async (
  nodeItem: NodeItem
): Promise<NodeItem[] | undefined> => {
  let choices = (await selectNodes(nodeItem, {
    canPickMany: true,
    title: "Select OnReady field to add",
  })) as NodeItem[] | undefined; // pick many
  logger.info(choices);
  return choices;
};

const build_snippet = (
  nodeItem: NodeItem,
  methods: NodeMethodQuickItem[],
  onReadys: NodeItem[]
): string => {
  const onreadysImports = onReadys
    .filter((p) => !p.isRustStruct)
    .map((p) => p.type);

  const cImports = classImports(nodeItem, onreadysImports);
  const decl_start = declGodotClassStart(nodeItem);
  const decl_end = declGodotClassEnd();
  const imp_start = implVirtualMethodsStart(nodeItem);
  const impl_end = implVirtualMethodsEnd();

  const virMethods = methods.map((x) => x.detail);

  const onreadysFields = onReadys.map((p) => onready_snippet(p).join("\n"));

  return cImports
    .concat(
      decl_start,
      onreadysFields,
      decl_end,
      imp_start,
      virMethods,
      impl_end
    )
    .join("\n");
};

const persist = async (
  selectedTscn: string,
  content: string
): Promise<vscode.Uri | undefined> => {
  let src = await getRustSrcDir();
  let newFileName = toSnake(
    path.basename(selectedTscn).replace(".tscn", ".rs")
  );
  let fileUri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(path.resolve(path.join(src, newFileName))),
  });
  logger.info(`Using new file uri: ${fileUri}`);
  if (fileUri === undefined) {
    return;
  }

  let encoder = new TextEncoder();
  let encodedContent = encoder.encode(content);

  await vscode.workspace.fs.writeFile(fileUri, encodedContent);
  logger.info(`New rust module created: ${fileUri}`);
  return fileUri;
};

const insertRustMod = async (editor: vscode.TextEditor, filename: string) => {
  logger.info(`Trying to update crate with mod ${filename}`);
  await applyCodeActionNamed(editor, `Insert \`mod ${filename};\``);
  logger.info("Insert mod complete");
};

class NodeMethodQuickItem implements QuickPickItem {
  label: string;
  detail: string;
  picked: boolean;

  constructor(label: string, detail: string, picked: boolean) {
    this.label = label;
    this.detail = detail.trimEnd();
    this.picked = picked;
  }
}
