import assert from "assert";
import path from "path";
import * as fs from "fs";
import { InputBox } from "vscode-extension-tester";
import { initTest } from "./ui-testutils.js";
import { GodotSettings } from "../../constantes.js";

describe("UI Godot4-rust test suite", () => {
  it("Test Godot set project command add configs to workspace", async () => {
    const { rootPath, driver, wb } = await initTest();
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

export const getSettings = (filepath: string): GodotSettings | undefined => {
  if (fs.existsSync(filepath)) {
    let settings: GodotSettings = JSON.parse(
      fs.readFileSync(filepath, {
        encoding: "utf-8",
      })
    );
    return settings;
  }
  return undefined;
};
