import Parser, { Tree, SyntaxNode } from "tree-sitter";

/// Base class to derive Parser From
/// Must reimplment lang()
export class TreeSitterParser {
  source: string;
  _parser: Parser = new Parser();
  _tree: Tree;

  constructor(source: string) {
    this.source = source;
    this._parser.setLanguage(this.lang);
    this._tree = this._parser.parse(source);
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
