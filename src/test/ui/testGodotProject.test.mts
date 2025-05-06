import  assert  from "assert";
import path from "path";
import * as fs from "fs";
import {
  BottomBarPanel,
  InputBox,
  OutputView,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { getSettings, initTest } from "../testutils.js";

describe("UI Godot4-rust test suite", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let bottomBar: BottomBarPanel;
  let outputView: OutputView;

  beforeEach(async () => {
    [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest();
  });

  it("Test Godot set project command add configs to workspace", async () => {
    let settingsFile = path.resolve(rootPath, ".vscode/settings.json");
    let godotProjectFilePath = path.resolve(
      "assets/GodotProject/project.godot"
    );

    if (fs.existsSync(settingsFile)) {
      fs.rmSync(settingsFile);
    }

    assert(
      getSettings(settingsFile) === undefined,
      "Attention settings exists"
    );

    await wb.executeCommand("godto4-rust.setGodotProject");
    let inp = await InputBox.create();
    await inp.confirm();
    await inp.setText(godotProjectFilePath);
    await inp.confirm();
    await driver.sleep(1000); // let it
    assert(fs.existsSync(settingsFile), `${settingsFile} devraient être créé`);

    let configPath =
      getSettings(settingsFile)?.["godot4-rust.godotProjectFilePath"];
    assert.equal(
      configPath!.toLowerCase(),
      godotProjectFilePath.toLowerCase(),
      "Les chemins ne sont pas les mêmes"
    );
  });
});
