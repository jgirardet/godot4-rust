import Parser, { Tree, SyntaxNode } from "tree-sitter";
import { FullPathFile } from "../types";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { readFile } from "fs/promises";

/// Base class to derive Parser From
/// Must reimplment lang()
export class TreeSitterParser {
  source: string;
  _parser: Parser = new Parser();
  _tree: Tree;

  constructor(source: string | FullPathFile) {
    if (existsSync(path.resolve(source))) {
      this.source = readFileSync(path.resolve(source), { encoding: "utf-8" });
    } else {
      this.source = source;
    }
    this._parser.setLanguage(this.lang);
    this._tree = this._parser.parse(this.source);
  }


  get lang(): Parser.Language {
    throw new Error(
      "getter lang must be implemented to extend TreeSitterParser"
    );
  }

  get rootNode(): SyntaxNode {
    return this._tree.rootNode;
  }
}
