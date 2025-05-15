import { GodotPath } from "../godot/godotPath";
import { Node } from "../godot/types";
import {
  TreeItem,
  TreeItemCheckboxState,
  TreeItemCollapsibleState,
  Uri,
  window,
} from "vscode";
import { GodotScene } from "../godot/godotScene";

export class NodeItem extends TreeItem {
  public children: NodeItem[] = [];
  instanceType?: string;

  tscn?: GodotPath;

  private constructor(
    public readonly node: Node,
    public readonly parent?: NodeItem
  ) {
    super(node.name.value);
    this.parent = parent;

    this.description = this.type;
    this.tooltip = this.type;
    this.iconPath = NodeItem.getIconUri(this.type);
    this.contextValue = this.isRoot ? "root" : "child";
    this.collapsibleState = TreeItemCollapsibleState.None;
  }

  get isRoot(): boolean {
    return this.node.parent === undefined;
  }

  get name(): string {
    return this.node.name.value;
  }

  get type(): string {
    return (
      this.node.type?.value || this.node.instance?.value.type.value || "Unknow"
    );
  }

  get path(): string {
    return this.node.parent?.value ?? "";
  }

  get isInstance(): boolean {
    return "instance" in this.node;
  }

  get hasChildren(): boolean {
    return this.children.length > 0;
  }

  reveal() {
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
    // revealChildren(this.children);
    for (const c of this.children) {
      c.reveal();
    }
  }

  getPackedSceneChildren(): NodeItem[] {
    let acc: NodeItem[] = [];
    getPackedChildren(this.children, acc);
    return acc;
  }

  static createRoot(scene: GodotScene): NodeItem {
    let root = new NodeItem(scene.rootNode);
    root.children = NodeItem.createChildren(scene.gdscene.nodes, root);
    root.collapsibleState = TreeItemCollapsibleState.Collapsed;
    root.tscn = scene.tscnpath;
    return root;
  }

  private static createChildren(nodes: Node[], root: NodeItem): NodeItem[] {
    let parents = new Map();
    parents.set(".", root);
    for (const n of nodes.slice(1)) {
      let asParentPath =
        n.parent!.value === "."
          ? n.name.value
          : n.parent!.value + "/" + n.name.value;
      const item = new NodeItem(n, parents[n.parent!.value as keyof object]);
      parents.set(asParentPath, item);
      parents.get(n.parent!.value)!.children.push(item);
      parents.get(n.parent!.value)!.collapsibleState =
        TreeItemCollapsibleState.Expanded;
    }
    return parents.get(".")!.children;
  }

  static getIconUri(nom: string): Uri | undefined {
    const godotIconPath = "../../../resources/godotIcons/godot_icons/";
    const godotRustPath =
      "../../../resources/godotIcons/godotrust/godot-ferris.svg";
    
      if (nom == "PackedScene")

    let theme = window.activeColorTheme.kind;
    let uri = Uri.joinPath(
      Uri.file(__filename),
      godotIconPath,
      `${[1, 4].includes(theme) ? "light" : "dark"}`,
      `${nom}.svg`
    );
    return uri;
  }

  static getGodotIcon() {
    const godotIconPath =
      "../../../resources/godotIcons/godotrust/godot-ferris.svg";

    // let theme = window.activeColorTheme.kind;
    let uri = Uri.joinPath(Uri.file(__filename), godotIconPath);
    //   `${[1, 4].includes(theme) ? "light" : "dark"}`,
    //   `${nom}.svg`
    // );
    return uri;
  }
}
const revealChildren = (children: NodeItem[]) => {
  for (const c of children) {
    c.collapsibleState = TreeItemCollapsibleState.Expanded;
    revealChildren(c.children);
  }
};

const getPackedChildren = (children: NodeItem[], acc: NodeItem[]) => {
  for (const c of children) {
    if (c.isInstance) {
      acc.push(c);
    } else {
      getPackedChildren(c.children, acc);
    }
  }
};
