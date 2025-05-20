import Parser, { Query, QueryCapture, SyntaxNode } from "tree-sitter";
import Rust from "tree-sitter-rust";
import { RustParsed } from "./types";
import { TreeSitterParser } from "../tree/treeSitterParser";
import { godotModuleQuery } from "../constantes";
import {
  getBoolean,
  getStringAttribute,
  getStringAttributeUnsafe,
} from "../tree/parseutils";

export class RustParser extends TreeSitterParser {
  get lang(): Parser.Language {
    return Rust as Parser.Language;
  }

  get rootNode(): SyntaxNode {
    return this.tree.rootNode;
  }

  get isGodotModule(): boolean {
    return this.source.match(/^use godot(?:;|::.+| as .*)$/m) !== null;
  }

  /// Find the First GodotClass in module
  findGodotClass(): RustParsed | undefined {
    let q = new Query(Rust as Parser.Language, godotModuleQuery);

    let captures = q.matches(this.rootNode).at(0)?.captures;
    if (!captures || captures.length === 0) {
      return;
    }

    return {
      className: getStringAttributeUnsafe("className", captures, this.tree),
      baseClass: getStringAttribute("baseClass", captures, this.tree),
      init: getBoolean("init", captures),
    };
  }
  //
  /// Warning: use only if key always is in capture
  _getStringUnsafe(key: string, captures: QueryCapture[]): string {
    const node = captures.find((a) => a.name === key)!.node;
    return this.tree.getText(node).replaceAll('"', "");
  }

  _getString(key: string, captures: QueryCapture[]): string | undefined {
    const node = captures.find((a) => a.name === key)?.node;
    if (node) {
      return this.tree.getText(node).replaceAll('"', "");
    }
  }
}
