import {
  CancellationToken,
  commands,
  Event,
  EventEmitter,
  ExtensionContext,
  FileSystemWatcher,
  ProviderResult,
  RelativePattern,
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
import { getGodotProjectDir } from "../godot/godotUtils";
import { NAME } from "../constantes";
import { GodotProjectLoader } from "../godot/godotProjectLoader";
import { GodotScene } from "../godot/godotScene";
import { logger } from "../log";

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
      (this.treeView = window.createTreeView(NAME, {
        treeDataProvider: this.treeData,
        showCollapseAll: true,
      })),
      (this.watcher = workspace.createFileSystemWatcher(
        new RelativePattern(this.godotDir, "**/*.tscn")
      )),
      this.watcher.onDidChange(this.onFileChanged.bind(this)),
      this.watcher.onDidCreate(this.onFileChanged.bind(this)),
      this.watcher.onDidDelete(this.onFileDeleted.bind(this)),
      this.treeView.onDidChangeSelection(this.onChangeSelection.bind(this)),

      commands.registerCommand(`${NAME}.reveal`, this.reveal.bind(this)),
      commands.registerCommand(
        `${NAME}.collapseAll`,
        this.collapseAll.bind(this)
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
    console.log(scenes);
    this.treeData.updateData(scenes);
  }

  async reveal() {
    let elm = this.treeData.data.get("Entities/Dracula/dracula.tscn");
    await this.collapseAll();
    console.log();
    await this.treeView.reveal(elm!, {
      expand: true,
      focus: true, // good scroll position
    });
    await commands.executeCommand("workbench.action.focusActiveEditorGroup"); //optionnable
  }

  async collapseAll() {
    return commands.executeCommand(
      `workbench.actions.treeView.${NAME}.collapseAll`
    );
  }

  async createNewGodotClass() {}
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
