import { basename } from "path";
import { GodotPath } from "../godot/godotPath";
import { GDScene, Node } from "../godot/types";

export interface PanelRolable {
  expand: boolean;

  get role(): PanelRole;

  get name(): string;

  get type(): string;

  get path(): string;

  get children(): PanelRolable[];

  get parent(): PanelRolable | null;
}

export enum PanelRole {
  File,
  Root,
  Child,
}

export class FileElement implements PanelRolable {
  expand = false;

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
    let root: NodeElement = new NodeElement(this.gdscene.nodes[0], this);
    for (const n of this.gdscene.nodes.slice(1)) {
      // toujours défini à ce stade
      if (n.parent!.value === ".") {
        root.children.push(new NodeElement(n, root));
      } else {
        const ancestor = root.children[root.children.length - 1];
        ancestor.children.push(new NodeElement(n, ancestor));
      }
    }
    return [root];
  }

  get parent(): PanelRolable | null {
    return null;
  }
}

export class NodeElement implements PanelRolable {
  expand = false;

  constructor(
    private node: Node,
    private ancestor: PanelRolable,
    private childs: NodeElement[] = []
  ) {}

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

  get parent(): PanelRolable {
    return this.ancestor;
  }

  get isInstance(): boolean {
    return "instance" in this.node;
  }
}
