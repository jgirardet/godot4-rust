import {
  BottomBarPanel,
  InputBox,
  MarkerType,
  TextEditor,
  ViewSection,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import {
  initTest,
  matchTrimedLine,
  multiSelect,
  pickItem,
} from "./ui-testutils.js";
import { join, resolve } from "path";
import { setConfig } from "../common.js";
import { AUTO_REPLACE_TSCN_KEY } from "../../constantes.js";
import { readUtf8Sync } from "../../utils.js";

describe("All func with rust analyzer", () => {
  let wb: Workbench,
    browser: VSBrowser,
    driver: WebDriver,
    panel: ViewSection,
    rootPath: string,
    settingsPath: string;
  before(async () => {
    const res = await initTest("assets/panel/panel", "assets/panel");
    wb = res.wb;
    browser = res.browser;
    driver = res.driver;
    panel = res.panel;
    rootPath = res.rootPath;
    settingsPath = res.settingsPath;

    const problemsView = await new BottomBarPanel().openProblemsView();

    await driver.wait(
      async () => {
        const markers = await problemsView.getAllVisibleMarkers(MarkerType.Any);
        // console.log(markers);
        return markers.length >= 2;
      },
      120000,
      "Diagnostic never occured",
      500
    );
  });

  // it("insertonready import good name", async () => {
  //   let child1f = join(rootPath, "src/other.rs");
  //   await browser.openResources(child1f);
  //   await driver.sleep(5000);
  //   let editor = new TextEditor();
  //   //  canvas
  //   let other1 = await pickItem("Other1", panel);
  //   let menu = await other1?.openContextMenu();
  //   await menu?.wait();
  //   await menu?.click();
  //   // child1 struct
  //   let oneChild1 = await pickItem("OneChild1", panel);
  //   menu = await oneChild1?.openContextMenu();
  //   await menu?.wait();
  //   await menu?.click();
  //   // http check name
  //   let child2 = await pickItem("Child22", panel);
  //   menu = await child2?.openContextMenu();
  //   await menu?.wait();
  //   await menu?.click();
  //   await matchTrimedLine(
  //     editor,
  //     6,
  //     "use crate::child_1::Child1Struct;",
  //     3000,
  //     "can't find Child1struct import"
  //   );
  //   await matchTrimedLine(
  //     editor,
  //     2,
  //     "classes::{Camera2D, CanvasLayer, HttpRequest, INode2D, Node2D, Sprite2D},",
  //     3000,
  //     "Can't find HttpRequest import"
  //   );
  //   await editor.save();
  //   await editor.save();

  // });
  it("insert mod", async () => {
    // setup
    const { driver, wb, godotDir, rootPath, panel, settingsPath } =
      await initTest("assets/panel/panel", "assets/panel");
    setConfig(rootPath, AUTO_REPLACE_TSCN_KEY, true);
    await panel.wait();
    let item = await pickItem("child_2.tscn (Child2)", panel);
    let menu = await item?.openContextMenu()!;
    await menu.select("Godot4-Rust: Create a new GodotClass from Godot Scene");
    let inp = await InputBox.create();
    await inp.selectQuickPick("Yes");
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
    await editor.save();

    //test autoswitch
    await driver.wait(
      () => {
        let tscn = readUtf8Sync(resolve(godotDir, "child_2.tscn"));
        return tscn.match(/node name=\"Child2\" type=\"Child2\"/) !== null;
      },
      2000,
      "should have match to test class autoswitch"
    );

    //test insert mod
    await driver.wait(
      async () => {
        let librs = join(rootPath, "src/lib.rs");
        return readUtf8Sync(librs).match(/mod child_2;/);
      },
      3000,
      "should have insert mod",
      500
    );
  });
});
