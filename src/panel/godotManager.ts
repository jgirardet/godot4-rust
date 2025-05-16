import {
  commands,
  Event,
  EventEmitter,
  ExtensionContext,
  FileSystemWatcher,
  ProviderResult,
  RelativePattern,
  TextEditor,
  TreeDataProvider,
  TreeItem,
  TreeView,
  TreeViewExpansionEvent,
  TreeViewSelectionChangeEvent,
  Uri,
  window,
  workspace,
} from "vscode";
import { NodeItem } from "./nodeItem";
import { FullPathDir, FullPathFile } from "../types";
import { NAME } from "../constantes";
import { GodotProjectLoader } from "../godot/godotProjectLoader";
import { GodotScene } from "../godot/godotScene";
import { logger } from "../log";
import { registerGCommand } from "../vscodeUtils";
import { getGodotProjectDir } from "../utils";
import { RustFiles, RustManager } from "../rust/rustmanager";
import { GodotPath } from "../godot/godotPath";
import path from "path";
import { TscnTreeProvider } from "./tscnTreeData";

export class GodotManager {
  treeView: TreeView<NodeItem>;
  treeData: TscnTreeProvider;
  watcher: FileSystemWatcher;
  godotProjectFile: FullPathFile;
  loader: GodotProjectLoader;
  rust: RustManager;

  constructor(context: ExtensionContext, godotProjectFile: FullPathFile) {
    this.godotProjectFile = godotProjectFile;
    this.treeData = new TscnTreeProvider(getGodotProjectDir(godotProjectFile));
    this.loader = new GodotProjectLoader(godotProjectFile);
    this.rust = new RustManager(context);

    context.subscriptions.push(
      //  treview
      (this.treeView = window.createTreeView(NAME, {
        treeDataProvider: this.treeData,
      })),
      // this.treeView.onDidChangeSelection(this.onChangeSelection.bind(this)),
      this.treeView.onDidExpandElement(this.onChangeSelection.bind(this)),
      //
      // watcher
      (this.watcher = workspace.createFileSystemWatcher(
        new RelativePattern(this.godotDir, "**/*.tscn")
      )),
      this.watcher.onDidChange(this.onFileChanged.bind(this)),
      this.watcher.onDidCreate(this.onFileChanged.bind(this)),
      this.watcher.onDidDelete(this.onFileDeleted.bind(this)),

      // commands
      registerGCommand(`reveal`, this.reveal.bind(this)),
      registerGCommand(`refresh`, this.reload.bind(this)),

      // connect signals
      window.onDidChangeActiveTextEditor(this.reveal.bind(this))
    );

    this.rust
      .reload()
      .then(this.reload.bind(this))
      .then(() =>
        commands.executeCommand("godot4-rust.resetViewLocation").then(() => {
          logger.info("Godot Manager Loaded");
        })
      );
  }

  get godotDir(): FullPathDir {
    return getGodotProjectDir(this.godotProjectFile);
  }

  async onChangeSelection(e: TreeViewExpansionEvent<NodeItem>) {}

  async onFileChanged(file: Uri) {
    logger.info(`${file.fsPath} modified, updating`);
    const scenes = await this.loader.onChange(file.fsPath);
    this.treeData.updateData(scenes, this.rust);
  }

  async onFileDeleted(file: Uri) {
    logger.info(`${file.fsPath} deleted, updating`);
    const scenes = await this.loader.onChange(file.fsPath, true);
    this.treeData.updateData(scenes, this.rust);
  }


  async reload() {
    const scenes = await this.loader.reload();
    this.treeData.updateData(scenes, this.rust);
  }

  async reveal(editor?: TextEditor) {
    editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    const file = editor?.document.fileName;
    let godotClass = this.rust.getByPath(file)?.className;
    if (!godotClass) {
      return;
    }
    for (const [k, v] of this.treeData.data.entries()) {
      if (v.type === godotClass) {
        return this._reveal(v);
      }
    }

    if (!editor) {
      // aka manual launch
      logger.info("No corresponding Godot Scene found");
    }
  }

  async collapseAll() {
    return commands.executeCommand(
      `workbench.actions.treeView.${NAME}.collapseAll`
    );
  }

  async _reveal(node: NodeItem) {
    logger.info(`Revealing ${node.name} with type ${node.type}`);
    await this.treeView.reveal(node, {
      expand: true,
      focus: true, // good scroll position
    });
  }
}
