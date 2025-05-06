import GODOT from "tree-sitter-godot-resource";
import { TreeSitterParser } from "../tree/treeSitterParser";
import Parser, { Query, QueryCapture } from "tree-sitter";
import { ExtResource } from "./types";
import { ExtResourcesQuery } from "./queries/loadQueries";

export class TscnParser extends TreeSitterParser {
  get lang(): Parser.Language {
    return GODOT as Parser.Language;
  }

  getExtResources(): ExtResource[] {
    let q = new Query(GODOT as Parser.Language, ExtResourcesQuery);
    let extResources: ExtResource[] = [];

    // if matched, then are always not null then Unsafe is ok
    for (const z of q.matches(this.rootNode)) {
      extResources.push({
        type: this._getStringValueUnsafe("type", z.captures),
        uid: this._getStringValueUnsafe("uid", z.captures),
        id: this._getStringValueUnsafe("id", z.captures),
        path: this._getStringValueUnsafe("path", z.captures),
      });
    }
    return extResources;
  }
  /// Warning: use only if key always is in capture
  _getStringValueUnsafe(key: string, captures: QueryCapture[]): string {
    return this._tree
      .getText(captures.find((a) => a.name === key)!.node)
      .replaceAll('"', "");
  }
}
