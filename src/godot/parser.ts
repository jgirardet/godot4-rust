import GODOT from "tree-sitter-godot-resource";
import { TreeSitterParser } from "../tree/treeSitterParser";
import Parser, { Query, QueryCapture } from "tree-sitter";
import {
  ExtResource,
  Node,
  StringAttribute,
  ExtResourceAttribute,
  GDScene,
} from "./types";
import { ExtResourcesQuery, NodesQuery, UidQuery } from "../constantes";

export class TscnParser extends TreeSitterParser {
  extResources: ExtResource[] = [];
  nodes: Node[] = [];

  get lang(): Parser.Language {
    return GODOT as Parser.Language;
  }

  parse(): GDScene {
    return {
      uid: this.getUid(),
      extResources: this.getExtResources(),
      nodes: this.getNodes(),
    };
  }

  getUid(): string {
    let q = new Query(GODOT as Parser.Language, UidQuery);
    let ra = q.matches(this.rootNode);
    return this._getStringAttributeUnsafe("uid", q.captures(this.rootNode))
      .value; // ! ok
  }

  getExtResources(): ExtResource[] {
    let q = new Query(GODOT as Parser.Language, ExtResourcesQuery);

    // if matched, then are always not null then Unsafe is ok
    for (const z of q.matches(this.rootNode)) {
      this.extResources.push({
        type: this._getStringAttributeUnsafe("type", z.captures),
        uid: this._getStringAttributeUnsafe("uid", z.captures),
        id: this._getStringAttributeUnsafe("id", z.captures),
        path: this._getStringAttributeUnsafe("path", z.captures),
      });
    }

    return this.extResources;
  }

  getNodes(): Node[] {
    let q = new Query(GODOT as Parser.Language, NodesQuery);

    // if matched, then are always not null then Unsafe is ok
    for (const z of q.matches(this.rootNode)) {
      let node: Node = {
        name: this._getStringAttributeUnsafe("name", z.captures),
      };

      for (const k of ["type", "parent"]) {
        let item = this._getStringAttribute(k, z.captures);
        if (item) {
          Object.assign(node, { [k]: item });
        }
      }

      let instance = this._getInstanceAttribute(z.captures);
      if (instance) {
        Object.assign(node, { instance: instance });
      }

      this.nodes.push(node);
    }
    return this.nodes;
  }

  //
  /// Warning: use only if key always is in capture
  _getStringAttributeUnsafe(
    key: string,
    captures: QueryCapture[]
  ): StringAttribute {
    const node = captures.find((a) => a.name === key)!.node;
    return {
      startPosition: node.startPosition,
      endPosition: node.endPosition,

      value: this._tree.getText(node).replaceAll('"', ""),
    };
  }

  _getStringAttribute(
    key: string,
    captures: QueryCapture[]
  ): StringAttribute | undefined {
    let res = this._getAttribute<StringAttribute>(key, captures);
    if (!res) {
      return;
    }
    return { ...res, value: res.value.replaceAll('"', "") };
  }

  /// Get a an instance, probably always a packedScene
  /// since Ext Resource contains positions, we give ExtResourceAttribute the position of the whole attribute
  _getInstanceAttribute(
    captures: QueryCapture[]
  ): ExtResourceAttribute | undefined {
    let instance = captures.find((i) => i.name === "instance");
    if (!instance) {
      return;
    }
    let constructor = this._getAttribute<StringAttribute>(
      "constructor",
      captures
    ); // if instance => constructor and resUid always non null
    if (!constructor || constructor.value !== "ExtResource") {
      return; // we don't support other cases, are there ?
    }
    let resId = this._getStringAttributeUnsafe("resId", captures);
    let extRes = this.extResources.find((x) => x.id.value === resId.value);
    if (!extRes) {
      return;
    }
    let attribute = instance.node.parent!; // always ok
    return {
      value: extRes,
      startPosition: attribute.startPosition,
      endPosition: attribute.endPosition,
    };
  }

  _getAttribute<T>(key: string, captures: QueryCapture[]): T | undefined {
    const node = captures.find((a) => a.name === key)?.node;
    if (!node) {
      return;
    }
    return {
      startPosition: node.startPosition,
      endPosition: node.endPosition,

      value: this._tree.getText(node),
    } as T;
  }
}

export const tscnParser = (content: string) => {
  return new TscnParser(content);
};
