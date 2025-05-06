import { assert } from "chai";
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
import { initTest, multiSelect } from "../testutils.js";

let LEVEL_SCENE_PATH = "Scenes/Main/LevelButton/level_button.tscn";
if (os.platform() === "win32") {
  LEVEL_SCENE_PATH = LEVEL_SCENE_PATH.replaceAll("/", "\\");
}
describe("addNewGodot class Command", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let inp: InputBox;
  let bottomBar: BottomBarPanel;
  let outputView: OutputView;

  beforeEach(async () => {
    [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest();
  });

  it("tests to add a new class from an empty file", async () => {
    await browser.openResources(path.join(rootPath, "src/empty.rs"));
    await wb.executeCommand("godot4-rust.newGodotClass");
    inp = await InputBox.create();
    await inp.selectQuickPick("No");
    await inp.selectQuickPick(LEVEL_SCENE_PATH);
    await multiSelect(inp, ["ready", "enter_tree"]);
    await inp.confirm();
    await multiSelect(inp, [0, 1, 2]);
    await inp.confirm();
    let editor = new TextEditor();
    let content = await editor.getText();
    assert.equal(
      content,
      fs
        .readFileSync(
          path.resolve("src/test/ui-test/assets/class_from_empty_file.rs")
        )
        .toString()
    );
    await editor.save(); // to avoid "do you want to save ?"
  });

  it("tests to add a new class from no file", async () => {
    await wb.executeCommand("godot4-rust.newGodotClass");
    inp = await InputBox.create();
    await inp.selectQuickPick("Yes");
    await inp.selectQuickPick(LEVEL_SCENE_PATH);
    await multiSelect(inp, ["ready", "enter_tree"]);
    await inp.confirm();
    await multiSelect(inp, [0, 1, 2]);
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
          path.resolve("src/test/ui-test/assets/class_from_empty_file.rs")
        )
        .toString()
    );
  });
});
