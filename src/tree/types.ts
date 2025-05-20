import { Point } from "tree-sitter";

export interface Attribute<T> {
  value: T;
  startPosition: Point;
  endPosition: Point;
}

export type StringAttribute = Attribute<string>;
export type BooleanAttribute = Attribute<Boolean>;