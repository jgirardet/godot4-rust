import { InputBox, TextEditor, TreeItem } from "vscode-extension-tester";
import { initTest, matchTrimedLine, pickItem } from "./ui-testutils.js";
import path from "path";
import { expect } from "earl";

describe("InsertSnippet Command", () => {
  let inp: InputBox;

  it("tests command alone", async () => {
    const { rootPath, browser, wb } = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );
    let child1f = path.join(rootPath, "src/child_1.rs");
    await browser.openResources(child1f);

    let editor = new TextEditor();
    await editor.setCursor(9, 13);
    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(2);
    let ligne1 = await editor.getTextAtLine(10);
    let ligne2 = await editor.getTextAtLine(11);
    expect(ligne1.trim()).toEqual(
      '#[init(node = "AChild1/AAChild1/AAAChild1")]'
    );
    expect(ligne2.trim()).toEqual("a_a_a_child_1: OnReady<Gd<Sprite2D>>,");
    await editor.save();
  });

  it("test panel, godotType, rust godoclass, import type, import name correct", async () => {
    const { rootPath, browser, wb, driver, panel } = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );

    let child1f = path.join(rootPath, "src/other.rs");
    await browser.openResources(child1f);
    let editor = new TextEditor();

    // test simple node
    let other1 = await pickItem("Other1", panel);
    let menu = await other1?.openContextMenu();
    await menu?.wait();
    await menu?.click();
    await matchTrimedLine(
      editor,
      2,
      "classes::{Camera2D, CanvasLayer, INode2D, Node2D, Sprite2D},",
      3000
    );
    await matchTrimedLine(editor, 14, '#[init(node = "Other1")]');
    await matchTrimedLine(editor, 15, "other_1: OnReady<Gd<CanvasLayer>>,");

    // test RustStruct
    let oneChild1 = await pickItem("OneChild1", panel);
    menu = await oneChild1?.openContextMenu();
    await menu?.wait();
    await menu?.click();
    await matchTrimedLine(editor, 6, "use crate::child_1::Child1Struct;", 3000);
    await matchTrimedLine(
      editor,
      18,
      '#[init(node = "Other1/Other11/Other111/OneChild1")]'
    );
    await matchTrimedLine(
      editor,
      19,
      "one_child_1: OnReady<Gd<Child1Struct>>,"
    );

    // test packedscene + good classname (HTTP/http)
    let child2 = await pickItem("Child22", panel);
    menu = await child2?.openContextMenu();
    await menu?.wait();
    await menu?.click();
    await matchTrimedLine(
      editor,
      2,
      "classes::{Camera2D, CanvasLayer, HttpRequest, INode2D, Node2D, Sprite2D},",
      3000
    );
    // ok in real testing be here it commes back in row, don't know why
    await matchTrimedLine(editor, 18, '#[init(node = "Other1/Child22")]');
    await matchTrimedLine(editor, 19, "child_22: OnReady<Gd<HttpRequest>>,");

    await editor.save();
  });
});
