import {
  EventEmitter,
  TreeDataProvider,
  Event,
  TreeItem,
  ProviderResult,
} from "vscode";
import { NodeItem } from "./nodeItem";
import { FullPathDir, FullPathFile } from "../types";
import { GodotScene } from "../godot/godotScene";
import { RustManager } from "../rust/rustmanager";
import { GodotPath } from "../godot/godotPath";
import { GODOT_STRUCTS } from "../godotClasses";

export class TscnTreeProvider implements TreeDataProvider<NodeItem> {
  data: Map<FullPathFile, NodeItem> = new Map();

  treeChanged = new EventEmitter<
    void | NodeItem | NodeItem[] | null | undefined
  >();

  constructor(private godotDir: FullPathDir) {}

  onDidChangeTreeData:
    | Event<void | NodeItem | NodeItem[] | null | undefined>
    | undefined = this.treeChanged.event;

  updateData(scenes: Map<string, GodotScene>, rust: RustManager) {
    this.data.clear();

    // initial load
    for (const [k, s] of scenes.entries()) {
      let searchedStruct = rust.modules.get(s.rootNode.type!.value); //ok
      let root = NodeItem.createRoot(s, searchedStruct);
      this.data.set(k, root);
    }

    // process packed scenes, afterwards
    for (const [k, v] of this.data.entries()) {
      let packed = v.getPackedSceneChildren();
      for (const p of packed) {
        let packedResPath = p.node.instance?.value.path.value;
        if (packedResPath) {
          let packedGPath = GodotPath.fromRes(packedResPath);
          let rootNodeItem = this.data.get(packedGPath.base);
          if (rootNodeItem) {
            p.instanceType = rootNodeItem.type;
            let serchedStruct = rust.modules.get(p.instanceType);
            if (serchedStruct) {
              p.iconPath = NodeItem.getGodotRustIconUri();
              p.tooltip = serchedStruct.baseClass;
            } else {
              if (p.type in GODOT_STRUCTS) {
                p.tooltip = rootNodeItem.tooltip;
                p.iconPath = rootNodeItem.iconPath;
              } else {
                p.setMissing();
              }
            }
          }
        }
      }
    }
    this.treeChanged.fire();
  }

  getTreeItem(element: NodeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  refresh() {
    this.treeChanged.fire();
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
