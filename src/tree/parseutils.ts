import { QueryCapture, Range, SyntaxNode, Tree } from "tree-sitter";
import { Ranged, StringRanged } from "./types";

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

export function parseStringRanged(node: SyntaxNode, kind: any): StringRanged {
  return {
    range: getRange(node),
    value: node.text,
  };
}

export function getRange({
  startIndex,
  endIndex,
  startPosition,
  endPosition,
}: SyntaxNode): Range {
  return {
    startIndex,
    endIndex,
    startPosition,
    endPosition,
  };
}

export function mergeNodeRanges(items: SyntaxNode[]): Range {
  const start = items[0];
  const end = items[items.length - 1];
  return {
    startIndex: start.startIndex,
    startPosition: start.startPosition,
    endIndex: end.endIndex,
    endPosition: end.endPosition,
  };
}

export function mergeCaptures(items: QueryCapture[]): Range {
  const start = items[0].node;
  const end = items[items.length - 1].node;
  return {
    startIndex: start.startIndex,
    startPosition: start.startPosition,
    endIndex: end.endIndex,
    endPosition: end.endPosition,
  };
}
