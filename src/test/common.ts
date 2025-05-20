import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { isAbsolute, join, resolve } from "path";
import { readUtf8Sync } from "../utils";
import { NAME } from "../constantes";

export const addGodotProjectPathSetting = (
  projectPath: string,
  godotProjectDir: string
) => {
  let dotvscode = resolve(projectPath, ".vscode");
  godotProjectDir = godotProjectDir ?? resolve("assets/GodotProject");
  let godotProject = join(godotProjectDir, "project.godot");
  if (!existsSync(dotvscode)) {
    mkdirSync(dotvscode);
  }
  let setting = {
    "godot4-rust.godotProjectFilePath": godotProject,
  };
  writeFileSync(
    resolve(projectPath, ".vscode/settings.json"),
    JSON.stringify(setting)
  );
};

export const cloneDirToTemp = (dirpath: string): string => {
  let tmp = mkdtempSync(join(tmpdir(), "grudot"));
  cpSync(dirpath, tmp, { recursive: true });
  return tmp;
};

export const setConfig = (rootPath: string, key: string, value: any) => {
  let setPath = resolve(rootPath, ".vscode/settings.json");
  let settings = JSON.parse(readUtf8Sync(setPath));
  Object.assign(settings, { [`${NAME}.${key}` as keyof Object]: value });
  writeFileSync(setPath, JSON.stringify(settings), { encoding: "utf-8" });
};


interface SetupTestArgs {
  dirRust: string;
  dirGodot: string;
  setGodotPath?: boolean;
}
export const setupTest = ({
  dirRust,
  dirGodot,
  setGodotPath = true,
}: SetupTestArgs): SetupTest => {
  if (!isAbsolute(dirRust)) {
    dirRust = resolve(__filename, "../../../assets", dirRust);
  }
  if (!isAbsolute(dirGodot)) {
    dirGodot = resolve(__filename, "../../../assets", dirGodot);
  }
  let rustPath = cloneDirToTemp(dirRust);
  let godotPath = cloneDirToTemp(dirGodot);
  let godotProject = join(godotPath, "project.godot");

  if (setGodotPath) {
    addGodotProjectPathSetting(rustPath, godotPath);
  }
  let settingsPath = resolve(rustPath, ".vscode/settings.json");
  let settings = JSON.parse(readUtf8Sync(settingsPath));

  return { rustPath, godotPath, settings, settingsPath, godotProject };
};

export interface SetupTest {
  rustPath: string;
  godotPath: string;
  settings: JSON;
  settingsPath: string;
  godotProject: string;
}
