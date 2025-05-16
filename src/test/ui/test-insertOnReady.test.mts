import assert from "assert";
import {
  BottomBarPanel,
  InputBox,
  Key,
  OutputView,
  TextEditor,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { initPanel, initTest } from "../testutils.js";
import path from "path";
import { child } from "winston";
import { expect } from "earl";

describe("InsertSnippet Command", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let inp: InputBox;
  let bottomBar: BottomBarPanel;
  let outputView: OutputView;

  beforeEach(async () => {
    [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );
  });

  it("tests one snippet is added to current file", async () => {
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
    let child1f = path.join(rootPath, "src/other.rs");
    await browser.openResources(child1f);

    let editor = new TextEditor();
    await editor.setCursor(13, 20);
    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(3);
    let ligne1 = await editor.getTextAtLine(14);
    let ligne2 = await editor.getTextAtLine(15);

    expect(ligne1.trim()).toEqual(
      '#[init(node = "Other1/Other11/Other111/OneChild1")]'
    );
    expect(ligne2.trim()).toEqual("one_child_1: OnReady<Gd<Child1Struct>>,");
    await editor.save()
  });
});
