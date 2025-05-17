import { assert } from "console";
import { GodotPath } from "../../../godot/godotPath";
import { GodotScene } from "../../../godot/godotScene";
import { NodeItem } from "../../../panel/nodeItem";
import {
  classImports,
  declGodotClassStart,
  implVirtualMethodsStart,
  onready_snippet,
} from "../../../snippets";
import { expect } from "earl";
import { Point } from "tree-sitter";
import path from "path";
import { Node } from "../../../godot/types";

suite("test class type are correct", () => {
  test("test standard import", () => {
    expect(classImports(fakeRootNodeItem("bla", "Node2D"), [])).toEqual([
      "use godot::{classes::{Node2D,INode2D}, prelude::*,};\n",
    ]);
  });
  test("test edge case import", () => {
    expect(classImports(fakeRootNodeItem("bla", "HTTPRequest"), [])).toEqual([
      "use godot::{classes::{HttpRequest,IHttpRequest}, prelude::*,};\n",
    ]);
  });
  test("test edge impl standard", () => {
    expect(
      implVirtualMethodsStart(fakeRootNodeItem("Bla", "HTTPRequest"))[1]
    ).toEqual("impl IHttpRequest for Bla {");
  });
  test("test edge declclass, class attribute", () => {
    expect(
      declGodotClassStart(fakeRootNodeItem("Bla", "HTTPRequest"))[1]
    ).toEqual("#[class(base=HttpRequest,init)]");
  });
  test("test edge declclass, base field", () => {
    expect(
      declGodotClassStart(fakeRootNodeItem("Bla", "HTTPRequest"))[3]
    ).toEqual("base: Base<HttpRequest>,");
  });
  test("test edge declclass, on ready", () => {
    expect(
      onready_snippet(fakeRootNodeItem("Bla", "HTTPRequest")).join("\n")
    ).toEqual('#[init(node = "/Bla")]\nbla: OnReady<Gd<HttpRequest>>,')
  });
  test("test edge declclass, on ready, no godot type", () => {
    expect(
      onready_snippet(fakeRootNodeItem("Bla", "RustStruct")).join("\n")
    ).toEqual('#[init(node = "/Bla")]\nbla: OnReady<Gd<RustStruct>>,')
  });
});

const fakeRootNodeItem = (nam: string, typ: string = "Node"): NodeItem => {
  return NodeItem.createRoot(
    new GodotScene(new GodotPath("bla.tscn"), {
      uid: "mlkml",
      nodes: [
        {
          name: {
            value: nam,
            endPosition: { column: 2, row: 2 },
            startPosition: { column: 2, row: 2 },
          },
          type: {
            value: typ,
            endPosition: { column: 2, row: 2 },
            startPosition: { column: 2, row: 2 },
          },
        },
      ],
      extResources: [],
    })
  );
};
