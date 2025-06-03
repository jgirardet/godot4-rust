import assert from "assert";
import path, { join, resolve } from "path";
import { InputBox } from "vscode-extension-tester";
import { fileExistsAsync, initTest, selectPath } from "./ui-testutils.js";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { expect } from "earl";
import { readUtf8Sync } from "../../utils.js";
import * as toml from "smol-toml";
import * as cheerio from "cheerio";
import { request } from "https";
import { setConfig } from "../common.js";

describe("start new  project", () => {
  let inp: InputBox;

  //   it("test the whole setup is ok", async () => {
  //     const { rootPath, driver, wb, godotDir } = await initTest();
  //     let crateName = "projet";
  //     let newRustDir = join(rootPath, crateName);
  //     let gdextension = join(godotDir, `${crateName}.gdextension`);
  //     const cargotoml = resolve(newRustDir, "Cargo.toml");
  //     await wb.executeCommand("godot4-rust.starNewGDExtensionProject");
  //     await selectPath(resolve(godotDir, "project.godot"));
  //     inp = await InputBox.create();
  //     await inp.setText(crateName);
  //     inp.confirm();
  //     await selectPath(resolve(rootPath));
  //     inp.confirm();
  //     // check files are created
  //     assert(await fileExistsAsync(join(newRustDir, "src", "lib.rs"), driver));
  //     assert(await fileExistsAsync(join(newRustDir, ".gitignore"), driver));
  //     assert(await fileExistsAsync(join(newRustDir, ".git/"), driver));
  //     assert(await fileExistsAsync(join(godotDir, "projet.gdextension"), driver));
  //     assert(
  //       await fileExistsAsync(join(newRustDir, ".vscode/settings.json"), driver)
  //     );
  //     assert(await fileExistsAsync(cargotoml, driver));

  //     // content of files
  //     const contenttoml = readUtf8Sync(join(newRustDir, "Cargo.toml"));
  //     const gdexttoml = toml.parse(
  //       await (
  //         await fetch(
  //           "https://raw.githubusercontent.com/godot-rust/gdext/refs/heads/master/godot/Cargo.toml"
  //         )
  //       ).text()
  //     );
  //     expect(contenttoml).toEqual(
  //       `[package]
  // name = "projet"
  // version = "0.1.0"
  // edition = "2024"

  // [lib]
  // crate-type = ["cdylib"]

  // [dependencies]
  // godot = "${(gdexttoml.package as { version: "" }).version}"`
  //     );

  //     assert.equal(
  //       readFileSync(join(newRustDir, "src", "lib.rs")).toString(),
  //       `use godot::prelude::*;

  // struct ProjetExtension;

  // #[gdextension]
  // unsafe impl ExtensionLibrary for ProjetExtension {}`
  //     );
  //     assert.equal(
  //       readFileSync(join(newRustDir, ".gitignore")).toString(),
  //       `debug/
  // target/
  // **/*.rs.bk
  // *.pdb`
  //     );
  //     expect(
  //       JSON.parse(readUtf8Sync(resolve(newRustDir, ".vscode/settings.json")))
  //     ).toEqual({
  //       "godot4-rust.godotProjectFilePath": path
  //         .resolve(godotDir, "project.godot")
  //         .replace("C:", "c:"),
  //       "rust-analyzer.check.overrideCommand": [
  //         "cargo",
  //         "build",
  //         "--quiet",
  //         "--workspace",
  //         "--message-format=json",
  //         "--all-targets",
  //         "--keep-going",
  //       ],
  //     });
  //   });

  it("test test skips gitinore if git/ in parent", async () => {
    const { rootPath, driver, wb, godotDir } = await initTest();
    await wb.executeCommand("rust-analyzer: stop server");
    let crateName = "projet";
    let newRootPath = join(rootPath, "sub");
    mkdirSync(newRootPath);
    mkdirSync(join(rootPath, ".git"));
    // setConfig(newRootPath, "rust-analyzer.check.overrideCommand", []);

    await wb.executeCommand("godot4-rust.starNewGDExtensionProject");
    await selectPath(join(godotDir, "project.godot"));
    inp = await InputBox.create();
    await inp.setText(crateName);
    await inp.wait();
    await driver.sleep(500);
    await inp.confirm();

    await selectPath(newRootPath);
    await driver.wait(
      () => existsSync(join(newRootPath, "projet", "Cargo.toml")),
      10000,
      "Can't find Cargo.toml in new projet"
    );
    try {
      await fileExistsAsync(join(newRootPath, "projet", ".gitignore"), driver);
    } catch (e: any) {
      assert.equal(
        e.message,
        `timeout waiting ${join(newRootPath, "projet", ".gitignore")}`
      );
    }
  });
});
