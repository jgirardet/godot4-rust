export type Uid = string;
export type ResPath = string;

export interface GDScene {
  uid: Uid;
  extResources: ExtResource[];
  subResources: SubResource[];
  rootNode: RootNode;
  nodes: Node[];
}

export interface ExtResource extends ResEntry {
  kind: string;
  type: string;
  path: string;
  id: string;
  uid: Uid;
}

export interface SubResource extends ResEntry {
  type: string;
  id: string;
}
export interface RootNode extends Omit<Node, "parent"> {
  type: string;
}

export interface Node extends Omit<ResEntry, "uid" | "path"> {
  kind: string;
  name: string;
  parent: string;
  resource?: ExtResource;
}

export interface ResEntry {
  kind: string;
  type?: string;
  name?: string;
  path?: string;
  instance?: string;
  uid?: string;
  instance_placeholder?: string;
  index?: string;
  groups?: string;
  id?: string;
}
