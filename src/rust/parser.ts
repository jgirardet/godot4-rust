import Parser, { Query, SyntaxNode } from "tree-sitter";
import Rust from "tree-sitter-rust";
import { ParsedGodotModule } from "./types";
import { TreeSitterParser } from "../tree/treeSitterParser";
import { godotModuleQuery } from "../constantes";

export class RustParser extends TreeSitterParser {
  get lang(): Parser.Language {
    return Rust as Parser.Language;
  }

  get rootNode(): SyntaxNode {
    return this._tree.rootNode;
  }

  get isGodotModule(): boolean {
    return this._source.match(/^use godot(?:;|::.+| as .*)$/m) !== null;
  }

  /// Find the First GodotClass in module
  findGodotClass(): ParsedGodotModule | undefined {
    let q = new Query(Rust as Parser.Language, godotModuleQuery);

    let captures = q.matches(this.rootNode).at(0)?.captures;
    if (!captures || captures.length === 0) {
      return;
    }

    let res: ParsedGodotModule = {};

    for (const c of captures) {
      if (["className", "baseClass", "init"].includes(c.name)) {
        res[c.name as keyof ParsedGodotModule] = this._tree.getText(c.node);
      }
    }

    return res;
  }
}
