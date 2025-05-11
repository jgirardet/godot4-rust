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
import { GODOT_CLASSES } from "../godot/godotClasses";
import { applyCodeActionNamed } from "../utils";
import path from "path";
import { toSnake } from "ts-case-convert";
import { getRustSrcDir } from "../cargo.js";
import {
  getGodotProjectDir,
  getGodotProjectFile,
  listTscnFiles,
} from "../godotProject";
import { selectNodes, selectTscn } from "../ui/select";
import { TscnParser } from "../godot/parser";
import { QuickPickItem } from "vscode";
import { Node } from "../godot/types";

export const newGodotClass = async () => {
  let persistFile = await vscode.window.showQuickPick(["Yes", "No"], {
    title: "Create new a new Rust module ?",
  });
  if (persistFile === undefined) {
    return;
  }

  let gpf = getGodotProjectFile();
  let gpd = getGodotProjectDir(gpf);
  const tscnFiles = listTscnFiles(gpf);
  const selectedTscn = await selectTscn(tscnFiles, gpd);
  if (!selectedTscn) {
    return;
  }

  let nodes = (await TscnParser.file(path.resolve(selectedTscn))).parse().nodes;

  const methods = buildMethodsList();
  const pickedMethod = await pickMethods(methods);
  if (pickedMethod === undefined) {
    logger.info("New Godot Class command: aborting");
    return;
  }
  const pickedOnready = await pickOnReady(nodes);
  if (pickedOnready === undefined) {
    logger.info("New Godot Class command: aborting");
    return;
  }

  const snippet = build_snippet(nodes[0], pickedMethod, pickedOnready);

  let editor: vscode.TextEditor | undefined;
  if (persistFile === "Yes") {
    let newFile = await persist(selectedTscn, snippet);
    if (newFile === undefined) {
      return;
    }
    editor = await vscode.window.showTextDocument(newFile);
  } else {
    editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
      return;
    }
    await editor.insertSnippet(new vscode.SnippetString(snippet));
  }

  await insertRustMod(
    editor,
    path.basename(editor.document.fileName).replace(".rs", "")
  );
  await vscode.commands.executeCommand("editor.action.formatDocument");
  vscode.window.showTextDocument(editor.document);
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

const pickOnReady = async (nodes: Node[]): Promise<Node[] | undefined> => {
  let choices = (await selectNodes(nodes, {
    canPickMany: true,
    title: "Select OnReady field to add",
  })) as Node[] | undefined; // pick many
  logger.info(choices);
  return choices;
};

const build_snippet = (
  rootNode: Node,
  methods: NodeMethodQuickItem[],
  onReadys: Node[]
): string => {
  const onreadysImports = onReadys
    .filter(
      (p) => GODOT_CLASSES.includes(p.type?.value || "") // TODO:FIX p.instance?.value.type.value)
    )
    .map((p) => p.type?.value ?? ""); // FIX FIX
  const cImports = classImports(rootNode, onreadysImports);
  const decl_start = declGodotClassStart(rootNode);
  const decl_end = declGodotClassEnd();
  const imp_start = implVirtualMethodsStart(rootNode);
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
    console.log(picked);
    this.label = label;
    this.detail = detail.trimEnd();
    this.picked = picked;
  }
}
