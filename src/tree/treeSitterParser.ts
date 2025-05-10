import Parser, { Tree, SyntaxNode } from "tree-sitter";
import { FullPathFile } from "../types";
import { readFile } from "fs/promises";

/// Base class to derive Parser From
/// Must reimplment lang()
export class TreeSitterParser {
  _source: string;
  _parser: Parser = new Parser();
  _tree: Tree;

  constructor(source: string) {
    this._parser.setLanguage(this.lang);
    this._tree = this._parser.parse(source);
    this._source = source;
  }
  static async file<T extends typeof TreeSitterParser>(
    this: T,
    file: FullPathFile
  ): Promise<InstanceType<T>> {
    let content = await readFile(file, { encoding: "utf-8" });
    return new this(content) as InstanceType<T>;
  }

  static async source<T extends typeof TreeSitterParser>(
    this: T,
    content: string
  ): Promise<InstanceType<T>> {
    return new this(content) as InstanceType<T>;
  }

  get lang(): Parser.Language {
    throw new Error(
      "getter lang must be implemented to extend TreeSitterParser"
    );
  }

  get rootNode(): SyntaxNode {
    return this._tree.rootNode;
  }

  parse(): any {
    throw new Error("parse method not implemented");
  }
}
