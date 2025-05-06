import Parser, { Tree, Query, SyntaxNode, QueryCapture } from "tree-sitter";
import Rust from "tree-sitter-rust";
import { godotModuleQuery } from "./queries/loadQueries";
import { ParsedGodotModule } from "./types";

export class RustParser {
  source: string;
  _parser: Parser = new Parser();
  _tree: Tree;

  constructor(source: string) {
    this.source = source;
    this._parser.setLanguage(Rust as Parser.Language);
    this._tree = this._parser.parse(source);
  }

  get rootNode(): SyntaxNode {
    return this._tree.rootNode;
  }

  get isGodotModule(): boolean {
    return this.source.match(/^use godot(?:;|::.+| as .*)$/m) !== null;
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
