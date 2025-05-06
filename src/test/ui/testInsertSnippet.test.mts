import  assert  from "assert";
import {
  BottomBarPanel,
  InputBox,
  OutputView,
  TextEditor,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { initTest } from "../testutils.js";

describe("InsertSnippet Command", () => {
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

  it("tests one snippet is added to current file", async () => {
    await wb.executeCommand("workbench.action.files.newUntitledFile");

    // first part test simple add
    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(0);
    await inp.selectQuickPick(4);

    let editor = new TextEditor();
    let ligne1 = await editor.getTextAtLine(1);
    let ligne2 = await editor.getTextAtLine(2);

    assert.equal(ligne1.trim(), '#[init(node = "MC/VB/Label")]');
    assert.equal(ligne2.trim(), "label: OnReady<Gd<Label>>,");

    // second part test "add it to then new line under if line is not empty"
    await wb.executeCommand("godot4-rust.insertOnReady");
    inp = await InputBox.create();
    await inp.selectQuickPick(0);
    await inp.selectQuickPick(4);

    ligne1 = await editor.getTextAtLine(1);
    ligne2 = await editor.getTextAtLine(2);
    let ligne3 = await editor.getTextAtLine(3);
    let ligne4 = await editor.getTextAtLine(4);

    assert.equal(ligne1.trim(), '#[init(node = "MC/VB/Label")]');
    assert.equal(ligne2.trim(), '#[init(node = "MC/VB/Label")]');
    assert.equal(ligne3.trim(), "label: OnReady<Gd<Label>>,");
    assert.equal(ligne4.trim(), "label: OnReady<Gd<Label>>,");

    await editor.clearText(); //avoid "save ?"
  });
});
