import { getConfigValue } from "./utils";
import * as ini from "ini";
import { logger } from "./log";
import { window } from "vscode";
import { GODOT_PROJECT_FILEPATH_KEY } from "./constantes";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { FullPathDir, FullPathFile, Name } from "./types";

export const getGodotProjectFile = (): FullPathFile => {
  const godotfp = getConfigValue(GODOT_PROJECT_FILEPATH_KEY);
  if (godotfp === undefined || godotfp.length === 0 || !existsSync(godotfp)) {
    window.showErrorMessage(
      "Godot Project is not set or incorrect. Use Ctrl+Maj+P => <Set Godot Project> to select .godot project file"
    );
    throw new Error("No Godot project Set");
  }
  return godotfp;
};

export const getGodotProjectDir = (projectFile?: FullPathFile): FullPathDir => {
  const gdp = path.dirname(projectFile ?? getGodotProjectFile());
  logger.info(`Godot Project pathdir: ${gdp}`);
  return gdp;
};

export const getParsedGodotProject = (
  projectFile?: FullPathFile
): GodotProject => {
  let text = readFileSync(projectFile || getGodotProjectFile(), {
    encoding: "utf-8",
  });
  const content = ini.parse(text) as IGodotProject;
  return new GodotProject(content);
};

interface IGodotProject {
  application: {
    "config/name": Name;
    "config/features": string;
  };
}

class GodotProject {
  _content: IGodotProject;

  constructor(content: IGodotProject) {
    this._content = content;
  }

  get version(): string {
    let res = this._content.application["config/features"]
      .match(/.*(\d\.\d).*/)
      ?.at(1);
    if (res === undefined) {
      throw new Error("Godot Project file seems invalid");
    }
    return res;
  }

  get name(): string {
    let res = this._content.application["config/name"];
    if (res === undefined) {
      throw new Error("Godot Project file seems invalid");
    }
    return res;
  }
}
