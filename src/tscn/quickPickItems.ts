import { QuickPickItem } from "vscode";
import { Node } from "./NodesBuilder";

export { NodeQuickItem, NodeMethodQuickItem };

class NodeQuickItem implements QuickPickItem {
  label: string;
  node: Node;
  constructor(node: Node) {
    this.node = node;
    let nb_sub = node.path.split("/").length;
    this.label = `${"-".repeat(nb_sub * 3)}> ${node.path}  (${node.type})`;
  }
}

class NodeMethodQuickItem implements QuickPickItem {
  label: string;
  detail: string;
  picked: boolean;

  constructor(label: string, detail: string, picked: boolean) {
    console.log(picked);
    this.label = label;
    this.detail = detail.trimEnd();
    this.picked = picked;
  }
}
