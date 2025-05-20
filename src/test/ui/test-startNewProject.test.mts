import assert from "assert";
import path, { join, resolve } from "path";
import { InputBox } from "vscode-extension-tester";
import { fileExistsAsync, initTest, selectPath } from "./ui-testutils.js";
import { mkdirSync, readFileSync } from "fs";
import { expect } from "earl";
import { readUtf8Sync } from "../../utils.js";

describe("start new  project", () => {
  let inp: InputBox;

  it("test the whole setup is ok", async () => {
    const { rootPath, driver, wb, godotDir } = await initTest();
    let crateName = "projet";
    let newRustDir = join(rootPath, crateName);
    let gdextension = join(godotDir, `${crateName}.gdextension`);
    const cargotoml = resolve(newRustDir, "Cargo.toml");
    await wb.executeCommand("godot4-rust.starNewGDExtensionProject");
    await selectPath(resolve(godotDir, "project.godot"));
    inp = await InputBox.create();
    await inp.setText(crateName);
    inp.confirm();
    await selectPath(resolve(rootPath));
    inp.confirm();
    // check files are created
    assert(await fileExistsAsync(join(newRustDir, "src", "lib.rs"), driver));
    assert(await fileExistsAsync(join(newRustDir, ".gitignore"), driver));
    assert(await fileExistsAsync(join(newRustDir, ".git/"), driver));
    assert(await fileExistsAsync(join(godotDir, "projet.gdextension"), driver));
    assert(
      await fileExistsAsync(join(newRustDir, ".vscode/settings.json"), driver)
    );
    assert(await fileExistsAsync(cargotoml, driver));

    // content of files
    const contenttoml = readUtf8Sync(join(newRustDir, "Cargo.toml"));
    expect(contenttoml).toEqual(
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
      readFileSync(join(newRustDir, "src", "lib.rs")).toString(),
      `use godot::prelude::*;

struct ProjetExtension;

#[gdextension]
unsafe impl ExtensionLibrary for ProjetExtension {}`
    );
    assert.equal(
      readFileSync(join(newRustDir, ".gitignore")).toString(),
      `debug/
target/
**/*.rs.bk
*.pdb`
    );
    expect(
      JSON.parse(readUtf8Sync(resolve(newRustDir, ".vscode/settings.json")))
    ).toEqual({
      "godot4-rust.godotProjectFilePath": path
        .resolve(godotDir, "project.godot")
        .replace("C:", "c:"),
    });
  });

  it("test test skips gitinore if git/ in parent", async () => {
    const { rootPath, driver, wb, godotDir } = await initTest();
    let crateName = "projet";
    let newRootPath = join(rootPath, "sub");
    mkdirSync(newRootPath);
    mkdirSync(join(rootPath, ".git"));

    await wb.executeCommand("godot4-rust.starNewGDExtensionProject");
    await selectPath(join(godotDir, "project.godot"));
    inp = await InputBox.create();
    await inp.setText(crateName);
    inp.confirm();

    await selectPath(newRootPath);
    assert(
      await fileExistsAsync(join(newRootPath, "projet", "Cargo.toml"), driver)
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
