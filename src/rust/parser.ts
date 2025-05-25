import Parser, { SyntaxNode } from "tree-sitter";
import Rust from "tree-sitter-rust";
import { TreeSitterParser } from "../tree/treeSitterParser";
import { Struct } from "./nodable";

export class RustParser extends TreeSitterParser {
  _godotClass?: Struct;

  constructor(source: string) {
    super(source);
    this._godotClass = findGodotStruct(this.rootNode);
  }

  get lang(): Parser.Language {
    return Rust as Parser.Language;
  }

  get rootNode(): SyntaxNode {
    return this.tree.rootNode;
  }

  get isGodotModule(): boolean {
    return this.source.match(/^use godot(?:;|::.+| as .*)$/m) !== null;
  }

  getGodotClass(): Struct | undefined {
    return this._godotClass;
  }
}
/// Find the First GodotClass in module
function findGodotStruct(parentNode: SyntaxNode): Struct | undefined {
  for (const node of parentNode.children) {
    if (node.type === "struct_item") {
      let struct = Struct.fromNode(node);
      if (struct.attribute("derive")?.argValue("GodotClass")) {
        return struct;
      }
    }
  }
}
