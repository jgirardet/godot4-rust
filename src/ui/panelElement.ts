import { basename } from "path";
import { GodotPath } from "../godot/godotPath";
import { GDScene, Node, StringAttribute } from "../godot/types";

export interface PanelRolable {
  get role(): PanelRole;

  get name(): string;

  get type(): string;

  get path(): string;

  get children(): PanelRolable[];
}

export enum PanelRole {
  File,
  Root,
  Child,
}

export class FileElement implements PanelRolable {
  constructor(private gdpath: GodotPath, private gdscene: GDScene) {}

  get type(): string {
    return "Scene";
  }

  get name(): string {
    return basename(this.gdpath.base);
  }

  get role(): PanelRole {
    return PanelRole.File;
  }

  get path(): string {
    return this.gdpath.base;
  }

  get children(): PanelRolable[] {
    return [getChildren(this.gdscene.nodes)];
  }
}

export class NodeElement implements PanelRolable {
  constructor(private node: Node, private childs: NodeElement[] = []) {}

  get role(): PanelRole {
    return this.node.parent ? PanelRole.Child : PanelRole.Root;
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

  get children(): PanelRolable[] {
    return this.childs;
  }

  get isInstance(): boolean {
    return "instance" in this.node;
  }
}

function getChildren(nodes: Node[]): NodeElement {
  let res: NodeElement = new NodeElement(nodes[0]);
  for (const n of nodes.slice(1)) {
    // toujours défini à ce stade
    if (n.parent!.value === ".") {
      res.children.push(new NodeElement(n));
    } else {
      (res.children[res.children.length - 1] as NodeElement).children.push(
        new NodeElement(n)
      );
    }
  }

  return res;
}
