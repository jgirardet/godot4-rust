import { QueryCapture, Tree } from "tree-sitter";
import { BooleanAttribute, StringAttribute } from "./types";

/// Warning: use only if key always is in capture
export function getStringAttributeUnsafe(
  key: string,
  captures: QueryCapture[],
  tree: Tree
): StringAttribute {
  const node = captures.find((a) => a.name === key)!.node;
  return {
    startPosition: node.startPosition,
    endPosition: node.endPosition,

    value: tree.getText(node).replaceAll('"', ""),
  };
}

export function getStringAttribute(
  key: string,
  captures: QueryCapture[],
  tree: Tree
): StringAttribute | undefined {
  let res = getAttribute<StringAttribute>(key, captures, tree);
  if (!res) {
    return;
  }
  return { ...res, value: res.value.replaceAll('"', "") };
}

export function getBoolean(key: string, captures: QueryCapture[]): boolean {
  const node = captures.find((a) => a.name === key)?.node;
  return node ? true : false;
}

export function getAttribute<T>(
  key: string,
  captures: QueryCapture[],
  tree: Tree
): T | undefined {
  const node = captures.find((a) => a.name === key)?.node;
  if (!node) {
    return;
  }
  return {
    startPosition: node.startPosition,
    endPosition: node.endPosition,

    value: tree.getText(node),
  } as T;
}
