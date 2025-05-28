import {
  commands,
  DiagnosticCollection,
  ExtensionContext,
  FileSystemWatcher,
  languages,
  RelativePattern,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
  TreeView,
  TreeViewSelectionChangeEvent,
  Uri,
  window,
  workspace,
} from "vscode";

import { NodeItem } from "./nodeItem";
import { FullPathDir, FullPathFile } from "../types";
import { AUTO_REPLACE_TSCN_KEY, NAME } from "../constantes";
import { GodotProjectLoader } from "../godot/godotProjectLoader";
import { logger } from "../log";
import {
  getConfigValue,
  rangeToVsRange,
  registerGCommand,
} from "../vscodeUtils";
import { getGodotProjectDir } from "../utils";
import { RustManager } from "../rust/rustmanager";
import { TscnTreeProvider } from "./tscnTreeData";
import { insertOnReady } from "../commands/insertOnready";
import { newGodotClass } from "../commands/newGodotClass";
import { switchGodotNodeByrust } from "../commands/switchGodotNodeByRust";
import { checkForInvalidNodePath } from "../diagnostics/godotPathDiag";
import { GodotClass } from "../rust/godoClass";

export class GodotManager {
  treeView: TreeView<NodeItem>;
  treeData: TscnTreeProvider;
  watcher: FileSystemWatcher;
  godotProjectFile: FullPathFile;
  loader: GodotProjectLoader;
  rust: RustManager;
  diags: DiagnosticCollection;

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
      this.treeView.onDidChangeSelection(this.onChangeSelection.bind(this)),
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

      // diags
      (this.diags = languages.createDiagnosticCollection(NAME)),
      // connect signals
      window.onDidChangeActiveTextEditor(this.onActiveEditorChanged.bind(this)),
      this.rust.onRustFilesChanged(async () => {
        logger.debug("Rust content changed, reloading panel");
        await this.reload();
      }),
      workspace.onDidChangeTextDocument(this.onTextContentChanged.bind(this))
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

  async onChangeSelection(e: TreeViewSelectionChangeEvent<NodeItem>) {
    const nodeItem = e.selection.at(0);
    if (nodeItem) {
      if (nodeItem.isRoot) {
        if (nodeItem.isRustStruct) {
          const editor = await window.showTextDocument(
            Uri.file(nodeItem.rustModule!.file), // checked with isRustStruct
            { preview: false }
          );
          editor.revealRange(rangeToVsRange(nodeItem.rustModule!.struct.range));
        }
      }
    }
  }

  async onActiveEditorChanged(editor?: TextEditor) {
    if (editor?.document) {
      await this.reveal(editor);
      this._triggerCheckForInvalidNodePath(editor?.document);
    }
  }

  async onTextContentChanged({ document }: TextDocumentChangeEvent) {
    this._triggerCheckForInvalidNodePath(document);
  }

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
    let nodeItem = this.getActiveNodeItem(editor?.document);
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

  getActiveNodeItem(document?: TextDocument): NodeItem | undefined {
    document = document || window.activeTextEditor?.document;
    if (!document) {
      return;
    }
    return Array.from(this.treeData.data, ([_, v]) => v).find(
      (v) => v.rustModule?.file === document.fileName
    );
  }

  _triggerCheckForInvalidNodePath(document: TextDocument) {
    const nodeItem = this.getActiveNodeItem(document);
    if (nodeItem) {
      let liveStruct = GodotClass.fromString(document.getText());
      this.diags.set(
        document.uri,
        checkForInvalidNodePath(nodeItem, liveStruct)
      );
    }
  }
}
