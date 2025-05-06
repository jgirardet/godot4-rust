export interface GDScene {
  uid: string;
  ext_resources: ExtResource[];
  nodes: Node[];
}

export interface ExtResource {
  type: string;
  uid: string;
  path: string;
  id: string;
}

export interface Node {
  name: string;
  type: string;
  parent?: string;
  instance?: ExtResource;
}
