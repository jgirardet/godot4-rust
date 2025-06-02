import { GodotPath } from "../godot/godotPath";
import { Node } from "../godot/types";
import { TreeItem, TreeItemCollapsibleState, Uri, window } from "vscode";
import { GodotScene } from "../godot/godotScene";
import { GODOT_STRUCTS } from "../godotClasses";
import { StoredGodotClass } from "../rust/godoClass";
import { basename } from "path";

export class NodeItem extends TreeItem {
  public children: NodeItem[] = [];
  private _instanceType?: string;
  rustModule?: StoredGodotClass;
  collapsibleState = TreeItemCollapsibleState.Expanded; // Expanded makes alignemnt better

  tscn?: GodotPath;
  _rustInstanceStruct?: string;

  private constructor(
    public readonly node: Node,
    public readonly parent?: NodeItem
  ) {
    super(node.name.value);

    this.label = {
      label: node.name.value,
      highlights: [],
    };
    this.parent = parent;
    this.contextValue = this.isRoot ? "root" : "child";
  }
  get basePath(): string {
    return this.node.parent?.value ?? "";
  }

  get flatChildren(): NodeItem[] {
    let acc: NodeItem[] = [];
    getFlatChildren(this.children, acc);
    return acc;
  }

  get fullPath(): string {
    return (this.basePath === "." ? "" : this.basePath + "/") + this.name;
  }

  get hasChildren(): boolean {
    return this.children.length > 0;
  }

  get instanceType(): string | undefined {
    return this._instanceType;
  }

  get isInstance(): boolean {
    return "instance" in this.node;
  }

  get isRoot(): boolean {
    return this.node.parent === undefined;
  }

  get isRustStruct(): boolean {
    return this.rustModule !== undefined;
  }

  get name(): string {
    return this.node.name.value;
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
      this.node.type?.value ||
      this.node.instance?.value.type.value ||
      "Unknow"
    );
  }

  get packedSceneChildren(): NodeItem[] {
    let acc: NodeItem[] = [];
    getPackedChildren(this.children, acc);
    return acc;
  }

  setup() {
    this.setLabel();
    this.setIconPath();
    this.setTooltip();
    this.setDescription(); // let last in case of missing tscn, see setDescription
  }

  setDescription() {
    if (this.isRoot) {
      if (this.isRustStruct) {
        this.description = `${this.rustModule?.className} \u279C ${this.rustModule?.baseClass}`;
      } else {
        this.description = `${this.type}`;
      }
    } else {
      if (this.isInstance) {
        // small hack to point out  missing tscn
        if (this.instanceType === undefined) {
          this.setMissing("Tscn file is missing");
          return;
        }

        this.description = `[${basename(
          GodotPath.fromRes(this.node.instance!.value.path.value).base
        )}]  ${this._rustInstanceStruct || this.instanceType}`;
      } else {
        this.description = this.type;
      }
    }
  }

  setHighlighOn() {
    this.label = {
      label: this.node.name.value,
      highlights: [[0, this.node.name.value.length]],
    };
  }

  setIconPath() {
    if (this.isRustStruct) {
      this.iconPath = getGodotRustIconUri();
    } else {
      this.iconPath = getIconUri(this.instanceType || this.type, false);
    }
  }

  setInstanceType(instanceRootNode: NodeItem) {
    if (instanceRootNode.isRustStruct) {
      this._instanceType = instanceRootNode.rustModule?.baseClass;
      this._rustInstanceStruct = instanceRootNode.rustModule?.className;
    } else {
      this._instanceType = instanceRootNode.type;
    }
  }

  setLabel() {
    if (this.isRoot) {
      this.label = {
        label: `${basename(this.tscn!.base)} (${this.name})`,
        highlights: [],
      };
    } else {
      this.label = {
        label: `${this.name}`,
        highlights: [],
      };
    }
  }

  setMissing(text?: string) {
    this.setHighlighOn();
    this.iconPath = getGodotMissingIconUri();
    this.tooltip = text || "Rust godot class missing";
    this.description = this.tooltip;
  }

  setTooltip() {
    if (this.isRoot) {
      this.tooltip = this.tscn?.base;
    } else {
      if (this.isInstance) {
        this.tooltip = `instance: ${
          GodotPath.fromRes(this.node.instance!.value.path.value).base
        }  |  type: ${this._rustInstanceStruct || this.instanceType}`;
      } else {
        this.tooltip = "";
      }
    }
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
      item.setup();
      parents.set(asParentPath, item);
      parents.get(n.parent!.value)!.children.push(item);
    }
    return parents.get(".")!.children;
  }

  static createRoot(
    scene: GodotScene,
    rustStruct?: StoredGodotClass
  ): NodeItem {
    let root = new NodeItem(scene.rootNode);
    root.children = NodeItem.createChildren(scene.gdscene.nodes, root);
    root.collapsibleState = TreeItemCollapsibleState.Collapsed;
    root.tscn = scene.tscnpath;
    if (rustStruct) {
      root.rustModule = rustStruct;
      root.contextValue = root.contextValue += "-rust";
    }

    if (rustStruct || root.type in GODOT_STRUCTS) {
      root.setup();
    } else {
      root.setMissing();
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

export function getIconUri(nom: string, isInstance: boolean): Uri | undefined {
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

function getGodotMissingIconUri() {
  return Uri.joinPath(
    Uri.file(__filename),
    "../../../resources/godotIcons/others/danger.svg"
  );
}

const getFlatChildren = (children: NodeItem[], acc: NodeItem[]) => {
  for (const c of children) {
    acc.push(c);
    getFlatChildren(c.children, acc);
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
