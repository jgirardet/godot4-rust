import { Range, SyntaxNode } from "tree-sitter";
import { getRange, mergeNodeRanges } from "../tree/parseutils";

export type NodableType =
  | string
  | boolean
  | number
  | {}
  | Nodable<NodableType>
  | Array<Nodable<NodableType>>;

export type DelimiterItem = "{" | "}" | "[" | "]" | "(" | ")";

export type HasArgParam = string | number | boolean;

export interface ArgValue {
  get argValue(): NodableType | undefined;
  hasArg: (val: HasArgParam) => boolean;
}

export interface Name {
  get name(): string;
}

export interface Attributable {
  attribute(ident: string): Attribute | undefined;
}

class Nodable<T extends NodableType> {
  constructor(readonly range: Range, readonly value: T) {}

  static fromNode(node: SyntaxNode): Nodable<any> {
    throw new Error(`Fail to parse '$${node.text}'. Static function 'fromNode' not yet implemented for ${node.type}, please report.
  node: ${node}`);
  }

  static fromNodes(nodes: SyntaxNode[]): Nodable<any> {
    throw new Error(`Fail to parse '$${nodes
      .map((x) => x.text)
      .join()}'. Static function 'fromNodes' not yet implemented for ${
      this.name
    }, please report.
  node: ${nodes}`);
  }
}

//------------------------- Primitive Value Class-------------------------//

export class BooleanLiteral extends Nodable<boolean> implements ArgValue {
  get argValue(): boolean {
    return this.value;
  }

  hasArg(val: HasArgParam): boolean {
    return typeof val === "boolean" && val === this.value;
  }

  static fromNode(node: SyntaxNode): BooleanLiteral {
    return new BooleanLiteral(
      getRange(node),
      node.text === "true" ? true : false
    );
  }
}

export class CharLiteral extends Nodable<string> implements ArgValue {
  get argValue(): NodableType | undefined {
    return this.value;
  }

  hasArg(val: HasArgParam): boolean {
    return this.value === val;
  }

  static fromNode(node: SyntaxNode): CharLiteral {
    return new CharLiteral(getRange(node), node.text.replaceAll("'", ""));
  }
}

export class Delimiter extends Nodable<DelimiterItem> {
  static fromNode(node: SyntaxNode): Delimiter {
    return new Delimiter(getRange(node), node.text as DelimiterItem);
  }
}

export class Identifier extends Nodable<string> implements ArgValue, Name {
  get name(): string {
    return this.value;
  }

  get argValue(): boolean {
    return true;
  }

  hasArg(val: HasArgParam): boolean {
    return val === this.name;
  }

  static fromNode(node: SyntaxNode): Identifier {
    return new Identifier(getRange(node), node.text);
  }
}

export class FloatLiteral extends Nodable<number> implements ArgValue {
  static fromNode(node: SyntaxNode): FloatLiteral {
    return new FloatLiteral(getRange(node), parseFloat(node.text));
  }
  get argValue(): number {
    return this.value;
  }

  hasArg(val: HasArgParam): boolean {
    return this.value === val;
  }
}

export class IntegerLiteral extends Nodable<number> implements ArgValue {
  static fromNode(node: SyntaxNode): IntegerLiteral {
    return new IntegerLiteral(getRange(node), parseInt(node.text));
  }
  get argValue(): number {
    return this.value;
  }

  hasArg(val: HasArgParam): boolean {
    return this.value === val;
  }
}

export class RawStringLiteral extends Nodable<string> implements ArgValue {
  get argValue(): string {
    return this.value;
  }

  hasArg(val: HasArgParam): boolean {
    return this.value === val;
  }

  static fromNode(node: SyntaxNode): RawStringLiteral {
    return new RawStringLiteral(getRange(node), node.text);
  }
}

export class StringLiteral extends Nodable<string> implements ArgValue {
  get argValue(): string {
    return this.value;
  }

  hasArg(val: HasArgParam): boolean {
    return this.value === val;
  }

  static fromNode(node: SyntaxNode): StringLiteral {
    return new StringLiteral(getRange(node), node.firstNamedChild!.text);
  }
}

// Garbage class used as plain string
export class Token extends Nodable<string> {
  static fromNode(node: SyntaxNode): Token {
    return new Token(getRange(node), node.text);
  }
}

//------------------------- Composed Classes -------------------------//

type Assignment = { lhs: Identifier; rhs: Nodable<NodableType> };
type ThreeNodes = [SyntaxNode, SyntaxNode, SyntaxNode];

export class AssignmentExp extends Nodable<Assignment> implements ArgValue {
  static fromNodes(nodes: ThreeNodes): AssignmentExp {
    return new AssignmentExp(mergeNodeRanges(nodes), {
      lhs: Identifier.fromNode(nodes[0]),
      rhs: parseNode(nodes[2]),
    });
  }
  get argValue(): NodableType {
    return this.value.rhs.value;
  }

  hasArg(val: HasArgParam): boolean {
    return val === this.value.lhs.name;
  }
}

type ArrayOfNodable = Array<Nodable<NodableType>>;
type ArrayOfNodableArgValue = Array<Nodable<NodableType> & ArgValue>;
type TokenTreeItem = {
  delimiters: [Delimiter, Delimiter];
  items: ArrayOfNodableArgValue;
};

export class TokenTree extends Nodable<TokenTreeItem> {
  getArgValue(val: HasArgParam): NodableType | undefined {
    return this.getArg(val)?.argValue;
  }

  getArg(val: HasArgParam): (NodableType & ArgValue) | undefined {
    return this.value.items.find((x) => x.hasArg(val));
  }

  static fromNode(node: SyntaxNode): TokenTree {
    const delimiters: [Delimiter, Delimiter] = [
      Delimiter.fromNode(node.firstChild!),
      Delimiter.fromNode(node.lastChild!),
    ];
    let exprs = node.children.slice(1, node.childCount - 1).reduce(
      (acc, val, _, __) => {
        if (val.type === ",") {
          acc.push([]);
        } else {
          acc[acc.length - 1].push(val);
        }
        return acc;
      },
      [[]] as SyntaxNode[][]
    );

    return new TokenTree(getRange(node), {
      delimiters,
      items: exprs
        .map((x) => parseExpr(x))
        .filter((x) => isArgValue(x)) as ArrayOfNodableArgValue, //checked with isArgValue
    });
  }
}

export class UnknowCollection extends Nodable<ArrayOfNodable> {
  static fromNodes(nodes: SyntaxNode[]): UnknowCollection {
    return new UnknowCollection(
      mergeNodeRanges(nodes),
      nodes.map((n) => parseNode(n))
    );
  }
}

//------------------------- Struct / Field / Attribute -------------------------//

type AttributeItem = {
  name: Identifier;
  args?: TokenTree;
};

export class Attribute extends Nodable<AttributeItem> implements Name {
  static fromNode(node: SyntaxNode): Attribute {
    const identifier = node.firstNamedChild!.firstNamedChild!;
    const argsumentsNode = node.firstNamedChild?.childForFieldName("arguments");

    const args = argsumentsNode
      ? TokenTree.fromNode(argsumentsNode)
      : undefined;
    return new Attribute(getRange(node), {
      name: Identifier.fromNode(identifier),
      args,
    });
  }

  get name(): string {
    return this.value.name.value;
  }

  getArg(key: HasArgParam): (NodableType & ArgValue) | undefined {
    return this.value.args?.getArg(key);
  }

  argValue(key: HasArgParam): NodableType | undefined {
    return this.value.args?.getArgValue(key);
  }
}

type FieldItem = {
  name: Identifier;
  attributes: Attribute[];
};

export class Field extends Nodable<FieldItem> implements Name, Attributable {
  attribute(ident: string): Attribute | undefined {
    return getAttribute(ident, this.value.attributes);
  }

  get name(): string {
    return this.value.name.value;
  }

  static fromNode(node: SyntaxNode): Field {
    return new Field(getRange(node), {
      name: Identifier.fromNode(node.firstNamedChild!),
      attributes: parseAttributes(node),
    });
  }
}

type StructItem = {
  name: Identifier;
  fields: Field[];
  attributes: Attribute[];
};

export class Struct extends Nodable<StructItem> implements Name, Attributable {
  attribute(ident: string): Attribute | undefined {
    return getAttribute(ident, this.value.attributes);
  }

  get name(): string {
    return this.value.name.value;
  }

  field(ident: string): Field | undefined {
    return this.value.fields.find((f) => f.name === ident);
  }

  static fromNode(node: SyntaxNode): Struct {
    const name = Identifier.fromNode(node.childForFieldName("name")!); // always
    let fieldDecla = node.childForFieldName("body");
    let attributes = parseAttributes(node);
    let fields =
      fieldDecla && fieldDecla.type === "field_declaration_list"
        ? parseFields(fieldDecla)
        : [];
    return new Struct(getRange(node), {
      name,
      fields,
      attributes,
    });
  }
}

//------------------------- Utilities  -------------------------//

// use in parseNode
const DISPATCHER = new Map<string, (node: SyntaxNode) => Nodable<NodableType>>([
  ["boolean_literal", BooleanLiteral.fromNode],
  ["char_literal", CharLiteral.fromNode],
  ["float_literal", FloatLiteral.fromNode],
  ["integer_literal", IntegerLiteral.fromNode],
  ["raw_string_literal", RawStringLiteral.fromNode],
  ["string_literal", StringLiteral.fromNode],
  ["identifier", Identifier.fromNode],
  // ["token_tree", TokenTree.fromNode], // later
  ["attribute_item", Attribute.fromNode],
  ["field_declaration", Field.fromNode],
  ["struct_item", Struct.fromNode],
]);

function getAttribute(
  ident: string,
  attributes: Attribute[]
): Attribute | undefined {
  return attributes.find((x) => x.name === ident);
}

function isArgValue(instance: Nodable<NodableType>): boolean {
  return "argValue" in instance && "hasArg" in instance;
}

function parseAttributes(node: SyntaxNode): Attribute[] {
  let res = [];
  let prevSib: SyntaxNode | null | undefined = node;
  while (true) {
    prevSib = prevSib?.previousSibling;
    if (prevSib?.type === "attribute_item") {
      res.push(Attribute.fromNode(prevSib));
    } else if (
      prevSib?.type === "line_comment" ||
      prevSib?.type === "block_comment"
    ) {
      prevSib === prevSib.previousSibling;
    } else {
      break;
    }
  }
  res.reverse(); // sinced parsed backward
  return res;
}

function parseExpr(nodes: SyntaxNode[]): Nodable<NodableType> {
  if (nodes.length === 1) {
    return parseNode(nodes[0]);
  } else if (nodes.length === 3) {
    if (nodes.at(1)?.type === "=") {
      return AssignmentExp.fromNodes(nodes as ThreeNodes);
    }
  }
  return UnknowCollection.fromNodes(nodes);
}

function parseFields(node: SyntaxNode): Field[] {
  let res = [];
  for (const n of node.children) {
    if (n.type === "field_declaration") {
      res.push(Field.fromNode(n));
    }
  }
  return res;
}

function parseNode(node: SyntaxNode): Nodable<NodableType> {
  const fn = DISPATCHER.get(node.type);
  if (fn) {
    return fn(node);
  } else {
    return Token.fromNode(node);
  }
}
