import { GodotScene } from "./godotScene";
import { ValueRanged, StringRanged, Ranged } from "../tree/types";

export type Uid = string;
export type ResPath = string;

export interface GDScene {
  uid: Uid;
  extResources: ExtResource[];
  nodes: Node[];
}

export interface ExtResource {
  type: StringRanged;
  uid: StringRanged;
  path: StringRanged;
  id: StringRanged;
}

export interface Node extends Ranged {
  name: StringRanged;
  type?: StringRanged;
  parent?: StringRanged;
  instance?: ExtResourceAttribute;
}

export type GodotRes = GodotScene;

export type ExtResourceAttribute = ValueRanged<ExtResource>;

export enum GodotKinds {
  Gdscene,
  ExtResource,
  ExtResourceAttribute,
  Node,
  Literal,
  Identifier,
}
