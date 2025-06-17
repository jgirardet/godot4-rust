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
import { validateCrateName } from "../../../commands/startNewGodotExtension";

suite("test snippets", () => {
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
      onready_snippet(fakeNodeItem("Bla", "HTTPRequest")).join("\n")
    ).toEqual('#[init(node = "Bla")]\nbla: OnReady<Gd<HttpRequest>>,');
  });
  test("test edge declclass, on ready, no godot type", () => {
    expect(
      onready_snippet(fakeNodeItem("Bla", "RustStruct", true)).join("\n")
    ).toEqual('#[init(node = "Bla")]\nbla: OnReady<Gd<RustStruct>>,');
  });
});

const fakeRootNodeItem = (nam: string, typ: string = "Node"): NodeItem => {
  return NodeItem.createRoot(
    new GodotScene(
      new GodotPath("bla.tscn"),

      {
        uid: "mlkml",
        rootNode: {
          kind: "node",
          type: typ,
          name: nam,
        },
        nodes: [
          {
            name: nam,
            type: typ,
            kind: "node",
            parent: nam,
          },
        ],
        extResources: [],
        subResources: [],
      }
    )
  );
};

const fakeNodeItem = (nam: string, typ: string, rust = false): NodeItem => {
  let n = new NodeItem({
    name: nam,
    type: typ,
    kind: "node",
    parent: ".",
  });
  if (rust) {
    n._rustInstanceStruct = typ;
  }
  return n;
};

suite("Test start new project", () => {
  test("validata crate", () => {
    expect(validateCrateName("Maj")).toBeFalsy();
    expect(validateCrateName("Es pace")).toBeFalsy();
    expect(validateCrateName("va-r_id")).toBeTruthy();
  });
});
