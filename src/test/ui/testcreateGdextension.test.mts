import path from "path";
import {
  BottomBarPanel,
  InputBox,
  ModalDialog,
  OutputView,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import {
  addGodotProjectPathSetting,
  cloneGrudotDirTemp,
  fileExistsAsync,
  initTest,
} from "../testutils.js";
import { existsSync, readFileSync, unlink, unlinkSync } from "fs";
import assert from "assert";

describe("create gdextension file", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let inp: InputBox;
  let bottomBar: BottomBarPanel;
  let outputView: OutputView;

  let godotDir: string;
  let crateName: string;
  let gdextension: string;

  beforeEach(async () => {
    [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest();
  });

  const init = async () => {
    godotDir = cloneGrudotDirTemp();
    console.log(`Godotdir Temp: ${godotDir}`);
    addGodotProjectPathSetting(rootPath, godotDir);
    await wb.executeCommand("godot4-rust.createGdextension");
    crateName = "proJet_un-Deux";
    gdextension = path.join(godotDir, `${crateName}.gdextension`);
    assert(
      await fileExistsAsync(gdextension, driver),
      "File should be created"
    );
  };

  it("test .gdextension is created and accurate", async () => {
    await init();
    let content = readFileSync(gdextension).toString("utf-8");
    console.log(content);
    assert.equal(
      content,
      `[configuration]
entry_symbol = "gdext_rust_init"
compatibility_minimum = 4.4
reloadable = true

[libraries]
linux.debug.x86_64 =     "res://../XXXXXX/target/debug/libproJet_un_Deux.so"
linux.release.x86_64 =   "res://../XXXXXX/target/release/libproJet_un_Deux.so"
windows.debug.x86_64 =   "res://../XXXXXX/target/debug/proJet_un_Deux.dll"
windows.release.x86_64 = "res://../XXXXXX/target/release/proJet_un_Deux.dll"
macos.debug =            "res://../XXXXXX/target/debug/libproJet_un_Deux.dylib"
macos.release =          "res://../XXXXXX/target/release/libproJet_un_Deux.dylib"
macos.debug.arm64 =      "res://../XXXXXX/target/debug/libproJet_un_Deux.dylib"
macos.release.arm64 =    "res://../XXXXXX/target/release/libproJet_un_Deux.dylib"`.replaceAll(
        "XXXXXX",
        path.basename(rootPath)
      )
    );
  });

  it("test .gdextension is create another if exists", async () => {
    await init();
    await wb.executeCommand("godot4-rust.createGdextension");
    let newFile = `new_${crateName}.gdextension`;
    await driver.sleep(1000);
    const dialog = new ModalDialog();
    await dialog.pushButton(`Name the new one ${newFile}`);
    console.log(newFile);
    const fp = path.join(godotDir, newFile);
    assert(await fileExistsAsync(fp, driver), "new sould be created");
  });

  it("test .gdextension overwrite if exists", async () => {
    await init();
    await wb.executeCommand("godot4-rust.createGdextension");
    await driver.sleep(1000);
    const dialog = new ModalDialog();
    unlinkSync(gdextension);
    assert(!existsSync(gdextension), "should be deleted");
    await dialog.pushButton(`Overwrite`);
    assert(
      await fileExistsAsync(gdextension, driver),
      "new sould be recreated"
    );
  });
});
