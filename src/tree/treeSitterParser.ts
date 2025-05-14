import Parser, { Tree, SyntaxNode } from "tree-sitter";
import { FullPathFile } from "../types";
import { readFile } from "fs/promises";
import { readUtf8 } from "../utils";

/// Base class to derive Parser From
/// Must reimplment lang()
export class TreeSitterParser {
  readonly source: string;
  readonly parser: Parser = new Parser();
  readonly tree: Tree;

  constructor(source: string) {
    this.parser.setLanguage(this.lang);
    this.tree = this.parser.parse(source);
    this.source = source;
  }
  static async file<T extends typeof TreeSitterParser>(
    this: T,
    file: FullPathFile
  ): Promise<InstanceType<T>> {
    let content = await readUtf8(file);
    return new this(content) as InstanceType<T>;
  }

  static source<T extends typeof TreeSitterParser>(
    this: T,
    content: string
  ): InstanceType<T> {
    return new this(content) as InstanceType<T>;
  }

  get lang(): Parser.Language {
    throw new Error(
      "getter lang must be implemented to extend TreeSitterParser"
    );
  }

  get rootNode(): SyntaxNode {
    return this.tree.rootNode;
  }

  parse(): any {
    throw new Error("parse method not implemented");
  }
}
