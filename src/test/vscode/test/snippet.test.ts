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
import path, { basename, resolve } from "path";
import { Node } from "../../../godot/types";
import { mkdtempSync, writeFileSync } from "fs";
import { switchGodotNodeByrust } from "../../../commands/switchGodotNodeByRust";
import { readUtf8Sync } from "../../../utils";
import { tmpdir } from "os";
import { validateCrateName } from "../../../commands/startNewGodotExtension";
import { GodotManager } from "../../../panel/godotManager";
import {
  commands,
  ExtensionContext,
  extensions,
  Uri,
  window,
  workspace,
} from "vscode";
import { setupTest, SetupTest, sleep } from "../../common";

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
      onready_snippet(fakeRootNodeItem("Bla", "HTTPRequest")).join("\n")
    ).toEqual('#[init(node = "/Bla")]\nbla: OnReady<Gd<HttpRequest>>,');
  });
  test("test edge declclass, on ready, no godot type", () => {
    expect(
      onready_snippet(fakeRootNodeItem("Bla", "RustStruct")).join("\n")
    ).toEqual('#[init(node = "/Bla")]\nbla: OnReady<Gd<RustStruct>>,');
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
            endPosition: { column: 8, row: 2 },
            startPosition: { column: 2, row: 2 },
          },
        },
      ],
      extResources: [],
    })
  );
};

suite("Test switch godot Class", () => {
  test("should switcher", async () => {
    let tmp = mkdtempSync(path.join(tmpdir(), "testswitchgrudot"));
    let tscn = resolve(tmp, "bla.tscn");
    let content = '\n\nO1"Rien"etautres\n\n';
    writeFileSync(tscn, content);
    let nodeItem = fakeRootNodeItem("Nom", "Rien");
    nodeItem.rustModule = {
      className: "RustClass",
      path: basename(tscn),
      init: true,
    };
    const res = await switchGodotNodeByrust(nodeItem, tmp);
    expect(readUtf8Sync(resolve(tmp, tscn))).toEqual(
      '\n\nO1"RustClass"etautres\n\n'
    );
  });
});

suite("Test start new project", () => {
  test("validata crate", () => {
    expect(validateCrateName("Maj")).toBeFalsy();
    expect(validateCrateName("Es pace")).toBeFalsy();
    expect(validateCrateName("va-r_id")).toBeTruthy();
  });
});

suite("Test Godot Manager", () => {
  // contect = activate();

  let $: SetupTest;

  // let extensionContext: ExtensionContext;

  // setup(function () {
  // });

  suiteSetup(async () => {
    // Trigger extension activation and grab the context as some tests depend on it
    // await extensions.getExtension("vscode.vscode-api-tests")?.activate();
    // extensionContext = (global as any).testExtensionContext;
  });

  test("init godot manager", async function () {
    $ = setupTest({ dirRust: "assets/panel/panel", dirGodot: "assets/panel" });
    // await commands.executeCommand("vscode.openFolder", Uri.file($.rustPath));
    // await sleep(3000);
    // let gm = new GodotManager(extensionContext, $.godotProject);
    console.log("AAAAAAAa");

    console.log(extensions.all.length);
    // let gm = extensions.getExtension("jgirardet.godot4-rust");
    console.log("BBBBBBBBBBBBB");
    // console.log(gm?.exports);
  });
});
