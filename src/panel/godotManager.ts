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
import { RustParser } from "../rust/parser";
import { registerGCommand } from "../vscodeUtils";
import { getGodotProjectDir } from "../utils";

export class GodotManager {
  treeView: TreeView<NodeItem>;
  treeData: TscnTreeProvider;
  watcher: FileSystemWatcher;
  godotProjectFile: FullPathFile;
  loader: GodotProjectLoader;

  constructor(context: ExtensionContext, godotProjectFile: FullPathFile) {
    this.godotProjectFile = godotProjectFile;
    this.treeData = new TscnTreeProvider();
    this.loader = new GodotProjectLoader(godotProjectFile);

    context.subscriptions.push(
      //  treview
      (this.treeView = window.createTreeView(NAME, {
        treeDataProvider: this.treeData,
        showCollapseAll: true,
      })),
      this.treeView.onDidChangeSelection(this.onChangeSelection.bind(this)),

      // watcher
      (this.watcher = workspace.createFileSystemWatcher(
        new RelativePattern(this.godotDir, "**/*.tscn")
      )),
      this.watcher.onDidChange(this.onFileChanged.bind(this)),
      this.watcher.onDidCreate(this.onFileChanged.bind(this)),
      this.watcher.onDidDelete(this.onFileDeleted.bind(this)),

      // commands
      registerGCommand(`reveal`, this.reveal.bind(this)),
      registerGCommand(
        `collapseAll`,
        this.collapseAll.bind(this),

        // connect signals
        window.onDidChangeActiveTextEditor(this.reveal.bind(this))
      )
    );

    this.reload().then(() => "Godot Manager Loaded");
  }

  get godotDir(): FullPathDir {
    return getGodotProjectDir(this.godotProjectFile);
  }

  onChangeSelection(e: TreeViewSelectionChangeEvent<NodeItem>) {
    console.log(e);
  }

  async onFileChanged(file: Uri) {
    logger.info(`${file.fsPath} modified, updating`);
    const scenes = await this.loader.onChange(file.fsPath);
    this.treeData.updateData(scenes);
  }

  async onFileDeleted(file: Uri) {
    logger.info(`${file.fsPath} deleted, updating`);
    const scenes = await this.loader.onChange(file.fsPath, true);
    this.treeData.updateData(scenes);
  }

  async reload() {
    const scenes = await this.loader.reload();
    this.treeData.updateData(scenes);
  }

  async reveal(editor?: TextEditor) {
    editor = window.activeTextEditor;
    let doc = editor?.document.getText();
    if (!doc) {
      return;
    }
    let parser = RustParser.source(doc);
    if (parser.isGodotModule) {
      let godotClass = parser.findGodotClass()?.className;
      console.log(godotClass);
      if (godotClass) {
        for (const [k, v] of this.treeData.data.entries()) {
          if (v.type === godotClass) {
            return this._reveal(v);
          }
        }
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
    await this.collapseAll();
    logger.info(`Revealing ${node.name} with type ${node.type}`);
    await this.treeView.reveal(node, {
      expand: true,
      focus: true, // good scroll position
    });
    await commands.executeCommand("workbench.action.focusActiveEditorGroup"); //optionnable
  }
}

class TscnTreeProvider implements TreeDataProvider<NodeItem> {
  data: Map<string, NodeItem> = new Map();

  treeChanged = new EventEmitter<
    void | NodeItem | NodeItem[] | null | undefined
  >();

  onDidChangeTreeData:
    | Event<void | NodeItem | NodeItem[] | null | undefined>
    | undefined = this.treeChanged.event;

  updateData(scenes: Map<string, GodotScene>) {
    this.data.clear();
    for (const [k, s] of scenes.entries()) {
      this.data.set(k, NodeItem.createRoot(s));
    }
    this.treeChanged.fire();
  }

  getTreeItem(element: NodeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  async getChildren(
    element?: NodeItem | undefined
  ): Promise<NodeItem[] | null | undefined> {
    if (!element) {
      let roots = [...this.data.values()];
      roots.sort((a, b) => (a.name > b.name ? 1 : -1));
      return roots;
    } else {
      return element.children;
    }
  }

  getParent(element: NodeItem): ProviderResult<NodeItem> {
    return element.parent;
  }

  // resolveTreeItem?(
  //   item: TreeItem,
  //   element: NodeItem,
  //   token: CancellationToken
  // ): TreeItem | null | undefined {
  //   throw new Error("Not implement resolveItem");
  // }
}
