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
      let searchedStruct = rust.modules.get(s.gdscene.rootNode.type);
      let root = NodeItem.createRoot(s, searchedStruct);
      this.data.set(k, root);
    }

    // process packed scenes, afterwards
    for (const v of this.data.values()) {
      for (const p of v.instanceChildren) {
        let resourcePath = p.node.resource?.path;
        // should be always true
        if (resourcePath) {
          // First Check if it is known node
          let packedGPath = GodotPath.fromRes(resourcePath);
          let rootNodeItem = this.data.get(packedGPath.base);
          if (rootNodeItem) {
            p.setInstanceType(rootNodeItem);
          } else {
            // not know: even missing tscn or other resource
            if (resourcePath.endsWith(".tscn")) {
              p.setInstanceType("Missing");
            } else {
              p.setInstanceType(p.node.resource?.type || "unkown");
            }
          }
          p.setup();
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
      roots.sort((a, b) => (a.tscn!.base > b.tscn!.base ? 1 : -1));
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
