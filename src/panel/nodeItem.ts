import { GodotPath } from "../godot/godotPath";
import { Node } from "../godot/types";
import { TreeItem, TreeItemCollapsibleState, Uri, window } from "vscode";
import { GodotScene } from "../godot/godotScene";

export class NodeItem extends TreeItem {
  public children: NodeItem[] = [];

  tscn?: GodotPath;

  private constructor(
    public readonly node: Node,
    public readonly parent?: NodeItem
  ) {
    super(node.name.value);
    this.parent = parent;

    this.collapsibleState = this.children
      ? this.parent
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.Collapsed
      : TreeItemCollapsibleState.None;

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
      this.node.type?.value || this.node.instance?.value.type.value || "Unknow"
    );
  }

  get path(): string {
    return this.node.parent?.value ?? "";
  }

  get isInstance(): boolean {
    return "instance" in this.node;
  }

  static createRoot(scene: GodotScene): NodeItem {
    let root = new NodeItem(scene.rootNode);
    root.children = NodeItem.createChildren(scene.gdscene.nodes, root);
    root.tscn = scene.tscnpath;
    return root;
  }

  private static createChildren(nodes: Node[], root: NodeItem) {
    let rootChildren = [];
    for (const n of nodes.slice(1)) {
      // toujours défini à ce stade
      if (n.parent!.value === ".") {
        rootChildren.push(new NodeItem(n, root));
      } else {
        const ancestor = rootChildren[rootChildren.length - 1];
        ancestor.children.push(new NodeItem(n, ancestor));
      }
    }
    return rootChildren;
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
}
