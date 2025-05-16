import { GodotPath } from "../godot/godotPath";
import { Node } from "../godot/types";
import { TreeItem, TreeItemCollapsibleState, Uri, window } from "vscode";
import { GodotScene } from "../godot/godotScene";
import { GodotModule, RustParsed } from "../rust/types";

export class NodeItem extends TreeItem {
  public children: NodeItem[] = [];
  private _instanceType?: string;
  rustModule?: GodotModule;
  collapsibleState = TreeItemCollapsibleState.Expanded; // Expanded makes alignemnt better

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
  }

  get isRoot(): boolean {
    return this.node.parent === undefined;
  }

  get name(): string {
    return this.node.name.value;
  }

  get type(): string {
    return (
      this.instanceType ||
      this.node.type?.value ||
      this.node.instance?.value.type.value ||
      "Unknow"
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

  get instanceType(): string | undefined {
    return this._instanceType;
  }

  set instanceType(value: string) {
    this._instanceType = value;
    this.description = value;
    // this.tooltip = value
  }

  get isRustStruct(): boolean {
    return this.rustModule !== undefined;
  }

  getPackedSceneChildren(): NodeItem[] {
    let acc: NodeItem[] = [];
    getPackedChildren(this.children, acc);
    return acc;
  }

  get flatChildren(): NodeItem[] {
    let acc: NodeItem[] = [];
    getFlatChildren(this.children, acc);
    return acc;
  }

  static createRoot(scene: GodotScene, rustStruct?: GodotModule): NodeItem {
    let root = new NodeItem(scene.rootNode);
    root.children = NodeItem.createChildren(scene.gdscene.nodes, root);
    root.collapsibleState = TreeItemCollapsibleState.Collapsed;
    root.tscn = scene.tscnpath;
    if (rustStruct) {
      root.iconPath = NodeItem.getGodotRustIcon();
      root.tooltip = rustStruct.className;
      root.rustModule = rustStruct;
      root.contextValue = root.contextValue += "-rust";
    }
    return root;
  }

  private static createChildren(nodes: Node[], root: NodeItem): NodeItem[] {
    let parents = new Map();
    parents.set(".", root);
    for (const n of nodes.slice(1)) {
      let parent =
        n.parent!.value === "." ? root : parents.get(n.parent!.value);
      let asParentPath =
        n.parent!.value === "."
          ? n.name.value
          : n.parent!.value + "/" + n.name.value;
      const item = new NodeItem(n, parent);
      parents.set(asParentPath, item);
      parents.get(n.parent!.value)!.children.push(item);
    }
    return parents.get(".")!.children;
  }

  static getIconUri(nom: string): Uri | undefined {
    const godotIconPath = "../../../resources/godotIcons/godot_icons/";

    let theme = window.activeColorTheme.kind;
    let uri = Uri.joinPath(
      Uri.file(__filename),
      godotIconPath,
      `${[1, 4].includes(theme) ? "light" : "dark"}`,
      `${nom}.svg`
    );
    return uri;
  }

  static getGodotRustIcon() {
    const godotIconPath =
      "../../../resources/godotIcons/godotrust/godot-ferris-16x16.svg";
    let uri = Uri.joinPath(Uri.file(__filename), godotIconPath);
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

const getFlatChildren = (children: NodeItem[], acc: NodeItem[]) => {
  for (const c of children) {
    acc.push(c);
    getFlatChildren(c.children, acc);
  }
};
