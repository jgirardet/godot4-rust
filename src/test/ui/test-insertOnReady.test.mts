import { InputBox, TextEditor } from "vscode-extension-tester";
import { initTest } from "./ui-testutils.js";
import path from "path";
import { expect } from "earl";

describe("InsertSnippet Command", () => {
  let inp: InputBox;

  it("tests one snippet is added to current file", async () => {
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

  it("tests rust tupe", async () => {
    const { rootPath, browser, wb, driver } = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );

    let child1f = path.join(rootPath, "src/other.rs");
    await browser.openResources(child1f);
    let editor = new TextEditor();

    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(3);

    await editor.save();
    await driver.wait(async () => {
      return (
        (await editor.getTextAtLine(6)) === "use crate::child_1::Child1Struct;"
      );
    }, 3000);
    
  

    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(6);

    // result
    let ligne1 = await editor.getTextAtLine(18);//inverted/ we do not wait save
    let ligne2 = await editor.getTextAtLine(19);
    expect(ligne1.trim()).toEqual(
      '#[init(node = "Other1/Other11/Other111/OneChild1")]'
    );
    expect(ligne2.trim()).toEqual("one_child_1: OnReady<Gd<Child1Struct>>,");

    ligne1 = await editor.getTextAtLine(16);
    ligne2 = await editor.getTextAtLine(17);
    expect(ligne1.trim()).toEqual('#[init(node = "Other1/Child2")]');
    expect(ligne2.trim()).toEqual("child_2: OnReady<Gd<HttpRequest>>,");
    await driver.wait(async () => {
      return (
        (await editor.getTextAtLine(2)).trim() ===
        "classes::{Camera2D, HttpRequest, INode2D, Node2D, Sprite2D},"
      );
    }, 3000);
    await editor.save();
  });
});
