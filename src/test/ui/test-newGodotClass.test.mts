import assert from "assert";
import path from "path";
import * as fs from "fs";
import * as os from "os";
import {
  BottomBarPanel,
  InputBox,
  OutputView,
  TextEditor,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { initPanel, initTest, multiSelect } from "../testutils.js";
import { expect } from "earl";

let LEVEL_SCENE_PATH = "/Scenes/Main/LevelButton/level_button.tscn";
describe("addNewGodot class Command", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let inp: InputBox;
  let bottomBar: BottomBarPanel;
  let outputView: OutputView;


  it("tests to add a new class from an empty file", async () => {
  [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest();
    let panel = await initPanel(rootPath, driver);
    await browser.openResources(path.join(rootPath, "src/empty.rs"));
    await wb.executeCommand("godot4-rust.newGodotClass");
    inp = await InputBox.create();
    await inp.selectQuickPick("No");
    inp = await InputBox.create();
    await inp.selectQuickPick(1);
    inp = await InputBox.create();
    await multiSelect(inp, ["ready", "enter_tree"]);
    await inp.confirm();
    await multiSelect(inp, [0, 1]);
    await inp.confirm();
    let editor = new TextEditor();
    let content = await editor.getText();
    await editor.save(); // to avoid "do you want to save ?"
    assert.equal(
      content,
      fs
        .readFileSync(
          path.resolve("src/test/ui/assets/class_from_empty_file.rs")
        )
        .toString()
    );
  });

  it("tests to add a new class from no file", async () => {
  [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest();
    await wb.executeCommand("godot4-rust.newGodotClass");
    inp = await InputBox.create();
    await inp.selectQuickPick("Yes");
    inp = await InputBox.create();
    await inp.selectQuickPick(1);
    inp = await InputBox.create();
    await multiSelect(inp, ["ready", "enter_tree"]);
    await inp.confirm();
    await multiSelect(inp, [0, 1]);
    await inp.confirm(); // confirm multiselect
    await driver.sleep(500);
    await inp.confirm(); // confirm file path
    driver.wait(async () => {
      (await wb.getEditorView().getOpenTabs()).length > 0;
    });
    let content = await new TextEditor().getText();
    assert.equal(
      content,
      fs
        .readFileSync(
          path.resolve("src/test/ui/assets/class_from_empty_file.rs")
        )
        .toString()
    );
  });

  it("tests add correct Rust type >< godot type", async () => {
    [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );
    await wb.executeCommand("godot4-rust.newGodotClass");
    inp = await InputBox.create();
    await inp.selectQuickPick("Yes");
    inp = await InputBox.create();
    await inp.selectQuickPick("child_2.tscn");
    inp = await InputBox.create();
    await inp.confirm();
    await multiSelect(inp, [0]);
    inp = await InputBox.create();
    await inp.confirm(); // confirm multiselect
    inp = await InputBox.create();
    await inp.confirm(); // confirm file path
    driver.wait(async () => {
      (await wb.getEditorView().getOpenTabs()).length > 0;
    });
    let editor = new TextEditor();
    let content = await editor.getText();
    await editor.save();
    expect(content).toEqual(
      `use godot::{classes::{HttpRequest,Node2D,IHttpRequest}, prelude::*,};

#[derive(GodotClass)]
#[class(base=HttpRequest,init)]
pub struct Child2 {
base: Base<HttpRequest>,
#[init(node = "Node2D")]
node_2_d: OnReady<Gd<Node2D>>,
}


#[godot_api]
impl IHttpRequest for Child2 {
fn ready(&mut self) {}
fn process(&mut self, delta: f64) {}
}`
    );
  });
});
