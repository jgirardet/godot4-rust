import {
  CancellationToken,
  EventEmitter,
  ExtensionContext,
  ProviderResult,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  TreeView,
  TreeViewSelectionChangeEvent,
  TreeViewVisibilityChangeEvent,
  Uri,
  window,
} from "vscode";
import { IGodotScene } from "../godot/godotScene";
import { NAME, WS_SCENES } from "../constantes";
import { GodotPath } from "../godot/godotPath";
import {
  FileElement,
  PanelRolable,
} from "./panelElement";

export class PanelProvider implements TreeDataProvider<PanelRolable> {
  _context: ExtensionContext;
  private _onDidChangeTreeData: EventEmitter<
    PanelRolable | undefined | null | void
  > = new EventEmitter();
  _treeview: TreeView<PanelRolable>;

  _data: PanelRolable[] = [];

  constructor(context: ExtensionContext) {
    this._context = context;
    this._treeview = window.createTreeView(NAME, {
      treeDataProvider: this,
      showCollapseAll: true,
    });
    this._context.subscriptions.push(
      this._treeview,
      this._treeview.onDidChangeSelection(this.clicked)
    );
  }

  // readonly onDidChangeTreeData: Event<PanelRolable | undefined | null | void> =
  //   this._onDidChangeTreeData.event;

  clicked({ selection }: TreeViewSelectionChangeEvent<PanelRolable>) {
    console.log(selection);
    this._treeview
      .reveal(selection[0], { expand: true, focus: true, select: false })
      .then(() => {});
  }

  clicked2(e: TreeViewVisibilityChangeEvent) {
    console.log("clicked2");
    console.log(e);
  }

  getTreeItem(element: PanelRolable): TreeItem | Thenable<TreeItem> {
    return new PanelItem(element);
  }
  getParent?(element: PanelRolable): ProviderResult<PanelRolable> {
    // let flat = this._data.flat(10)
    // let idx = flat.findIndex((v,_, __)=>{
    //   element.name === v.name && element.
    // })
    return null;
  }
  resolveTreeItem?(
    item: TreeItem,
    element: PanelRolable,
    token: CancellationToken
  ): ProviderResult<TreeItem> {
    throw new Error("Method not implemented.");
  }

  getChildren(
    element?: PanelRolable | undefined
  ): ProviderResult<PanelRolable[]> {
    if (!element) {
      this._data =
        this._context.workspaceState
          .get<IGodotScene[]>(WS_SCENES)
          ?.map((s: IGodotScene) => {
            return new FileElement(new GodotPath(s.path.base), s.gdscene);
          }) || [];
      this._data.sort((a, b) => (a.name > b.name ? 1 : -1));
      return this._data;
    } else {
      return element.children;
    }
  }
}

class PanelItem extends TreeItem {
  readonly description: string;
  constructor(item: PanelRolable) {
    super(
      item.name,
      TreeItemCollapsibleState.Collapsed
      // item.children.length === 0
      //   ? TreeItemCollapsibleState.Collapsed
      //   : TreeItemCollapsibleState.None
    );
    this.description = item.type;
    this.iconPath = PanelItem.getIconUri(item.type);

  }

  static getIconUri(nom: string): Uri | undefined {
    const godotIconPath = "../../../resources/godotIcons/godot_icons/";
    if (nom === "Scene") {
      return Uri.joinPath(
        Uri.file(__filename),
        godotIconPath,
        "../godot_icon.svg"
      );
    }

    let theme = window.activeColorTheme.kind;
    let uri = Uri.joinPath(
      Uri.file(__filename),
      godotIconPath,
      `${[1, 4].includes(theme) ? "light" : "dark"}`,
      `${nom}.svg`
    );
    return uri;
  }
}
