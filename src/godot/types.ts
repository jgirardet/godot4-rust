import { Point } from "tree-sitter";
import { GodotScene } from "./godotScene";

export type Uid = string;
export type ResPath = string;

export interface GDScene {
  uid: Uid;
  extResources: ExtResource[];
  nodes: Node[];
}

export interface ExtResource {
  type: StringAttribute;
  uid: StringAttribute;
  path: StringAttribute;
  id: StringAttribute;
}

export interface Node {
  name: StringAttribute;
  type?: StringAttribute;
  parent?: StringAttribute;
  instance?: ExtResourceAttribute;
}

export interface Attribute<T> {
  value: T;
  startPosition: Point;
  endPosition: Point;
}

export type StringAttribute = Attribute<string>;
export type ExtResourceAttribute = Attribute<ExtResource>;

export type GodotRes = GodotScene;
