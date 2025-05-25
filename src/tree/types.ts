import { Range } from "tree-sitter";

export type Rangeable = string | boolean | number | Ranged | {};

export interface Ranged {
  range: Range;
}

export interface ValueRanged<T extends Rangeable> extends Ranged {
  value: T;
}

export interface StringRanged extends ValueRanged<string> {}
