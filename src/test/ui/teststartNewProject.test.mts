import assert from "assert";
import path from "path";
import {
  BottomBarPanel,
  InputBox,
  OutputView,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import {
  cloneGrudotDirTemp,
  fileExistsAsync,
  initTest,
  selectPath,
} from "../testutils.js";
import { mkdirSync, readFileSync } from "fs";

describe("start new gdextensin project", () => {
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
  let newRustDir: string;

  beforeEach(async () => {
    [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest();
  });

  const init = async () => {
    godotDir = cloneGrudotDirTemp();
    console.log(`Godotdir Temp: ${godotDir}`);
    // addGodotProjectPathSetting(rootPath, godotDir);
    crateName = "projet";
    newRustDir = path.join(rootPath, crateName);
    gdextension = path.join(godotDir, "projet", `${crateName}.gdextension`);
  };

  it("test the whole setup is ok", async () => {
    await init();
    await wb.executeCommand("godot4-rust.starNewGDExtensionProject");
    await selectPath(path.join(godotDir, "project.godot"));
    inp = await InputBox.create();
    await inp.setText(crateName);
    inp.confirm();
    await selectPath(rootPath);

    // check files are created
    assert(await fileExistsAsync(path.join(newRustDir, "Cargo.toml"), driver));
    assert(
      await fileExistsAsync(path.join(newRustDir, "src", "lib.rs"), driver)
    );
    assert(
      await fileExistsAsync(
        path.join(newRustDir, ".vscode", "settings.json"),
        driver
      )
    );
    assert(await fileExistsAsync(path.join(newRustDir, ".gitignore"), driver));
    assert(await fileExistsAsync(path.join(newRustDir, ".git/"), driver));
    assert(
      await fileExistsAsync(path.join(godotDir, "projet.gdextension"), driver)
    );

    // content of files
    assert.equal(
      readFileSync(path.join(newRustDir, "Cargo.toml")).toString(),
      `[package]
name = "projet"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
godot = "0.2.4"`
    );
    assert.equal(
      readFileSync(path.join(newRustDir, "src", "lib.rs")).toString(),
      `use godot::prelude::*;

struct ProjetExtension;

#[gdextension]
unsafe impl ExtensionLibrary for ProjetExtension {}`
    );
    assert.equal(
      readFileSync(
        path.join(newRustDir, ".vscode", "settings.json")
      ).toString(),
      `{"godot4-rust.godotProjectFilePath":"${path.join(
        godotDir,
        "project.godot"
      )}"}`
    );
    assert.equal(
      readFileSync(path.join(newRustDir, ".gitignore")).toString(),
      `debug/
target/
**/*.rs.bk
*.pdb`
    );
  });

  it("test validate crate name", async () => {
    await init();
    await wb.executeCommand("godot4-rust.starNewGDExtensionProject");
    await selectPath(path.join(godotDir, "project.godot"));
    inp = await InputBox.create();
    await inp.setText("Maj");
    inp.confirm();
    await inp.setText("Esp ace");
    inp.confirm();
    await inp.setText("val-i_d");
    inp.confirm();
    await selectPath(rootPath);
    assert(
      await fileExistsAsync(
        path.join(rootPath, "val-i_d", "Cargo.toml"),
        driver
      )
    );
  });
  it("test test skips gitinore if git/ in parent", async () => {
    await init();
    let newRootPath = path.join(rootPath, "sub");
    mkdirSync(newRootPath);
    mkdirSync(path.join(rootPath, ".git"));

    await wb.executeCommand("godot4-rust.starNewGDExtensionProject");
    await selectPath(path.join(godotDir, "project.godot"));
    inp = await InputBox.create();
    await inp.setText(crateName);
    inp.confirm();

    await selectPath(newRootPath);
    assert(
      await fileExistsAsync(
        path.join(newRootPath, "projet", "Cargo.toml"),
        driver
      )
    );
    try {
      await fileExistsAsync(
        path.join(newRootPath, "projet", ".gitignore"),
        driver
      );
    } catch (e: any) {
      assert.equal(
        e.message,
        `timeout waiting ${path.join(newRootPath, "projet", ".gitignore")}`
      );
    }
  });
});
