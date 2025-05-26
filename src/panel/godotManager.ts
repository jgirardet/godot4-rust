import {
  commands,
  ExtensionContext,
  FileSystemWatcher,
  RelativePattern,
  TextEditor,
  TreeView,
  TreeViewExpansionEvent,
  Uri,
  window,
  workspace,
} from "vscode";

import { NodeItem } from "./nodeItem";
import { FullPathDir, FullPathFile } from "../types";
import { AUTO_REPLACE_TSCN_KEY, NAME } from "../constantes";
import { GodotProjectLoader } from "../godot/godotProjectLoader";
import { logger } from "../log";
import { getConfigValue, registerGCommand } from "../vscodeUtils";
import { getGodotProjectDir } from "../utils";
import { RustManager } from "../rust/rustmanager";
import { TscnTreeProvider } from "./tscnTreeData";
import { insertOnReady } from "../commands/insertOnready";
import { newGodotClass } from "../commands/newGodotClass";
import { switchGodotNodeByrust } from "../commands/switchGodotNodeByRust";

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
      registerGCommand("insertOnReady", this.insertOnReady.bind(this)),
      registerGCommand("newGodotClass", this.newGodotClass.bind(this)),
      registerGCommand("replaceBaseClass", this.replaceBaseClass.bind(this)),

      // connect signals
      window.onDidChangeActiveTextEditor(this.reveal.bind(this)),
      this.rust.onRustFilesChanged(async () => {
        logger.info("Rust content changed, reloading panel");
        this.reload();
      })
    );

    this.rust
      .reload()
      .then(this.reload.bind(this))
      .then(() =>
        commands.executeCommand("godot4-rust.resetViewLocation").then(() => {
          commands.executeCommand("godot4-rust.reveal");
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
    let nodeItem = this.getActiveNodeItem(editor);
    if (nodeItem) {
      logger.info(`Revealing ${nodeItem.name} with type ${nodeItem.type}`);
      await this.treeView.reveal(nodeItem, {
        expand: true,
        focus: true, // good scroll position
      });
    }
  }

  async insertOnReady(nodeItem?: NodeItem) {
    nodeItem = nodeItem || this.getActiveNodeItem();
    if (nodeItem) {
      await insertOnReady(this, nodeItem);
    }
  }

  async newGodotClass(nodeItem?: NodeItem) {
    nodeItem = await newGodotClass(this, nodeItem);
    if (getConfigValue<boolean>(AUTO_REPLACE_TSCN_KEY)) {
      await commands.executeCommand("godot4-rust.replaceBaseClass", nodeItem);
    }
  }

  async replaceBaseClass(nodeItem?: NodeItem) {
    try {
      await switchGodotNodeByrust(this, nodeItem);
      logger.info("Change Type complete");
    } catch (e: any) {
      await this.reload();
      throw e;
    }
  }

  getActiveNodeItem(editor?: TextEditor): NodeItem | undefined {
    editor = editor || window.activeTextEditor;
    let doc = editor?.document;
    if (!doc) {
      return;
    }
    return Array.from(this.treeData.data, ([_, v]) => v).find(
      (v) => v.rustModule?.file === doc.fileName
    );
  }
}
