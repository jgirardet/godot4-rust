import { GodotPath } from "../godot/godotPath";
import { Node, RootNode } from "../godot/types";
import { TreeItem, TreeItemCollapsibleState, Uri, window } from "vscode";
import { GodotScene } from "../godot/godotScene";
import { GODOT_STRUCTS } from "../godotClasses";
import { StoredGodotClass } from "../rust/godoClass";
import { basename } from "path";

const GHOST_TYPE = "xxxGhostxxx";
const CTX_ROOT = "root";
const CTX_CHILD = "child";
const CTX_RUST = "rust";

export class NodeItem extends TreeItem {
  public children: NodeItem[] = [];
  private _instanceType?: string;
  rustModule?: StoredGodotClass;
  collapsibleState = TreeItemCollapsibleState.Expanded; // Expanded makes alignemnt better

  tscn?: GodotPath;
  _rustInstanceStruct?: string;

  constructor(
    public readonly node: Node | RootNode,
    public readonly parent?: NodeItem
  ) {
    super(node.name);

    this.label = {
      label: node.name,
      highlights: [],
    };
  }

  get flatChildren(): NodeItem[] {
    let acc: NodeItem[] = [];
    getFlatChildren(this.children, acc);
    return acc;
  }

  get fullParent(): string {
    if ("parent" in this.node) {
      return (
        (this.node.parent === "." ? "" : this.node.parent + "/") + this.name
      );
    }
    return ""; // typechecker
  }

  get hasChildren(): boolean {
    return this.children.length > 0;
  }

  get instanceType(): string | undefined {
    return this._instanceType;
  }

  get isInstance(): boolean {
    return "resource" in this.node;
  }

  get isRoot(): boolean {
    return !("parent" in this.node);
  }

  get isRustStruct(): boolean {
    return this.rustModule !== undefined;
  }

  get name(): string {
    return this.node.name;
  }

  get rootNode(): NodeItem {
    if (this.isRoot) {
      return this;
    }
    let parent = this.parent;
    while (true) {
      if (parent?.isRoot) {
        return parent;
      }
      if (!parent) {
        throw new Error("Can't find root node");
      }
      parent = parent?.parent;
    }
  }

  get rustType(): string {
    return (
      this._rustInstanceStruct ||
      GODOT_STRUCTS[this.type as keyof typeof GODOT_STRUCTS] ||
      ""
    );
  }

  get type(): string {
    return (
      this.instanceType ||
      this.node.type ||
      this.node.resource?.type ||
      "Unknow"
    );
  }

  get instanceChildren(): NodeItem[] {
    let acc: NodeItem[] = [];
    getInstanceChildren(this.children, acc);
    return acc;
  }

  setup() {
    if (this.instanceType === "Missing") {
      this.setupMissing();
    } else if (this.isRoot) {
      if (this.isRustStruct) {
        this.setupRootRust();
      } else {
        this.setupRoot();
      }
    } else {
      if (this.isInstance) {
        if (this.node.resource?.path.endsWith(".tscn")) {
          this.setupInstanceTscn();
        } else {
          this.setupInstanceOther();
        }
      } else {
        if (this.type === GHOST_TYPE) {
          this.setupGhost();
        } else {
          this.setupChild();
        }
      }
    }
  }

  setHighlighOn() {
    this.label = {
      label: this.node.name,
      highlights: [[0, this.node.name.length]],
    };
  }

  setInstanceType(instanceRootNode: NodeItem | string) {
    if (typeof instanceRootNode === "string") {
      this._instanceType = instanceRootNode;
    } else {
      if (instanceRootNode.isRustStruct) {
        this._instanceType = instanceRootNode.rustModule?.baseClass;
        this._rustInstanceStruct = instanceRootNode.rustModule?.className;
      } else {
        this._instanceType = instanceRootNode.type;
      }
    }
  }

  setMissing(text: string) {
    this.setupMissing();
    this.tooltip = text;
    this.description = this.tooltip;
  }

  setupRoot() {
    this.description = `${this.type}`;
    this.iconPath = getIconUri(this.type);
    this.label = {
      label: `${basename(this.tscn!.base)} (${this.name})`,
      highlights: [],
    };
    this.tooltip = this.tscn?.base;
    this.contextValue = CTX_ROOT;
  }

  setupRootRust() {
    this.description = `${this.rustModule?.className} \u279C ${this.rustModule?.baseClass}`;
    this.iconPath = getGodotRustIconUri();
    this.label = {
      label: `${basename(this.tscn!.base)} (${this.name})`,
      highlights: [],
    };
    this.tooltip = this.tscn?.base;
    this.contextValue = [CTX_ROOT, CTX_RUST].join("-");
  }

  setupInstanceTscn() {
    this.description = `[${basename(
      GodotPath.fromRes(this.node.resource?.path || "").base
    )}]  ${this._rustInstanceStruct || this.instanceType}`;

    this.iconPath = getIconUri(this.instanceType || this.type);
    this.tooltip = `instance: ${
      GodotPath.fromRes(this.node.resource?.path || "").base
    }  |  type: ${this._rustInstanceStruct || this.instanceType}`;
    this.contextValue = CTX_CHILD;
  }

  setupInstanceOther() {
    this.description = `[${basename(
      GodotPath.fromRes(this.node.resource?.path || "").base
    )}]  ${this.node.resource!.type}`;
    this.iconPath = getIconUri(this.node.resource?.type || "PackedScene");
    this.tooltip = basename(this.node.resource?.path || "unsupported");
    this.contextValue = "";
  }

  setupGhost() {
    this.description = "Ghost node";
    this.iconPath = getOtherIconUri("ghost.svg");
    this.tooltip = this.description + " ignore";
    this.contextValue = "";
  }

  setupMissing() {
    this.setHighlighOn();
    this.iconPath = getOtherIconUri("danger.svg");
    this.tooltip = "Missing";
    this.description = this.tooltip;
    this.contextValue = "";
  }

  setupMissingRootRust() {
    this.setMissing("Rust Godot Class missing");
    this.contextValue = CTX_ROOT;
  }

  setupChild() {
    this.description = this.type;
    this.iconPath = getIconUri(this.type);
    this.tooltip = this.type;
    this.contextValue = CTX_CHILD;
  }

  private static createChildren(nodes: Node[], root: NodeItem): NodeItem[] {
    let parents = new Map();
    parents.set(".", root);
    for (const n of nodes) {
      createNodeChild(n, parents);
    }
    return parents.get(".")!.children;
  }

  static createRoot(
    scene: GodotScene,
    rustStruct?: StoredGodotClass
  ): NodeItem {
    let root = new NodeItem(scene.gdscene.rootNode);
    root.children = NodeItem.createChildren(scene.gdscene.nodes, root);
    root.collapsibleState = TreeItemCollapsibleState.Collapsed;
    root.tscn = scene.tscnpath;
    if (rustStruct) {
      root.rustModule = rustStruct;
    }

    if (rustStruct || root.type in GODOT_STRUCTS) {
      root.setup();
    } else {
      root.setupMissingRootRust();
    }
    return root;
  }
}

export function getGodotRustIconUri() {
  return Uri.joinPath(
    Uri.file(__filename),
    "../../../resources/godotIcons/godotrust/godot-ferris-16x16.svg"
  );
}

export function getIconUri(nom: string): Uri | undefined {
  const godotIconPath = "../../../resources/godotIcons/godot_icons/";

  let theme = window.activeColorTheme.kind;
  const uri = Uri.joinPath(
    Uri.file(__filename),
    godotIconPath,
    `${[1, 4].includes(theme) ? "light" : "dark"}`,
    `${nom}.svg`
  );
  return uri;
}

function getOtherIconUri(name: string) {
  return Uri.joinPath(
    Uri.file(__filename),
    "../../../resources/godotIcons/others/" + name
  );
}

const getFlatChildren = (children: NodeItem[], acc: NodeItem[]) => {
  for (const c of children) {
    acc.push(c);
    getFlatChildren(c.children, acc);
  }
};

const getInstanceChildren = (children: NodeItem[], acc: NodeItem[]) => {
  for (const c of children) {
    if (c.isInstance) {
      acc.push(c);
    } else {
      getInstanceChildren(c.children, acc);
    }
  }
};

function createNodeChild(node: Node, allParents: Map<string, NodeItem>) {
  let parent = allParents.get(node.parent);
  if (!parent) {
    parent = createGhostParent(node.parent, allParents);
  }
  const item = new NodeItem(node, parent);
  item.setup();
  allParents.set(asParentPath(node.name, node.parent), item);
  parent.children.push(item);
}

function createGhostParent(
  ghostParentPath: string,
  allParents: Map<string, NodeItem>
): NodeItem {
  const ancestors = ghostParentPath.split("/");
  const nodeToCreateName = ancestors.pop();
  if (!nodeToCreateName) {
    throw new Error(
      `Fantom node should have a name, fantomParent: ${ghostParentPath}`
    );
  }

  let parentPath = ancestors.join("/");
  if (parentPath !== "") {
    if (!allParents.has(parentPath)) {
      createGhostParent(parentPath, allParents);
    }
  } else {
    parentPath = ".";
  }
  return createGhostNode(nodeToCreateName, parentPath, allParents);
}

function createGhostNode(
  name: string,
  parent: string,
  allParents: Map<string, NodeItem>
): NodeItem {
  const parentNode = allParents.get(parent)!;
  const item = new NodeItem(
    {
      type: GHOST_TYPE,
      kind: "node",
      name,
      parent,
    },
    parentNode
  );
  item.setup();
  parentNode.children.push(item);
  allParents.set(asParentPath(name, parent), item);
  return item;
}

function asParentPath(name: string, parentName: string): string {
  return parentName === "." ? name : parentName + "/" + name;
}
