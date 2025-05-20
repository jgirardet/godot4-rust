import { Point } from "tree-sitter";
import { GodotScene } from "./godotScene";
import { Attribute, StringAttribute } from "../tree/types";

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


export type GodotRes = GodotScene;

export type ExtResourceAttribute = Attribute<ExtResource>;