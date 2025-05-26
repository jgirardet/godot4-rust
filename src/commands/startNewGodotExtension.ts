import path from "path";
import { logger } from "../log";
import { commands, Uri, window } from "vscode";
import { selectGodotProject } from "./setGodotProject";
import { FullPathDir, FullPathFile, Name } from "../types";
import { getParsedGodotProject } from "../godotProject";
import { kebabCase, pascalCase } from "string-ts";
import { runCargoCommand } from "../cargo";
import {
  GODOT_PROJECT_FILEPATH_KEY,
  LAST_GODOT_CRATE_VERSION_AS_TOML,
  NAME,
} from "../constantes";
import { mkdirSync, writeFileSync } from "fs";
import { processCreateGdextension } from "./createGdextension";
import { execSync } from "child_process";
import findParentDir from "find-parent-dir";

export const startNewExtensionCommand = async () => {
  logger.info("Starting new extension");

  const godotFileProject = await selectGodotProjectStep();
  if (godotFileProject === undefined) {
    logger.warn("Aborting");
    return;
  }

  const crateName = await writeCrateNameStep(godotFileProject);
  if (crateName === undefined) {
    logger.warn("Aborting");
    return;
  }

  const rustParentDir = await selecRustParentDirStep(
    path.dirname(godotFileProject)
  );
  if (rustParentDir === undefined) {
    logger.warn("Aborting");
    return;
  }

  const gd = new NewGDExtension(godotFileProject, rustParentDir, crateName);
  await gd.build();
  commands.executeCommand("vscode.openFolder", Uri.file(gd.crateDir));
};

class NewGDExtension {
  // project.godot path
  _godotProjectFile: FullPathFile;

  // Directory which will contains rustDir
  _rustDirBase: FullPathDir;

  // crate name
  _crateName: Name;

  // godot project directory
  get godotDir(): FullPathDir {
    return path.dirname(this._godotProjectFile);
  }

  // godot.project path
  get godotProjectFile(): FullPathFile {
    return this._godotProjectFile;
  }

  // Crate'sDir path
  get crateDir(): FullPathDir {
    return path.join(this._rustDirBase, this._crateName);
  }

  constructor(
    godotProject: FullPathFile,
    rustDirBase: FullPathDir,
    crateName: Name
  ) {
    this._godotProjectFile = godotProject;
    this._rustDirBase = rustDirBase;
    this._crateName = crateName;
    window.showQuickPick;
  }

  build = async () => {
    // create rust dir structur
    mkdirSync(path.join(this.crateDir, "src/"), { recursive: true });

    // create Cargo.toml
    writeFileSync(
      path.join(this.crateDir, "Cargo.toml"),
      buildCargoToml(this._crateName)
    );

    // create lib.rs
    writeFileSync(
      path.join(this.crateDir, "src", "lib.rs"),
      buildLibRs(this._crateName)
    );

    // create vscode settings
    mkdirSync(path.join(this.crateDir, ".vscode"), { recursive: true });
    writeFileSync(
      path.join(this.crateDir, ".vscode", "settings.json"),
      JSON.stringify({
        [`${NAME}.${GODOT_PROJECT_FILEPATH_KEY}`]: this._godotProjectFile,
      })
    );

    // create gdextension
    await processCreateGdextension(
      this._crateName,
      this.crateDir,
      this._godotProjectFile
    );

    // setup git
    setupGit(this.crateDir);
  };
}

export const validateCrateName = (name: string): boolean => {
  if (/[^a-z|\-|_|0-9]/.test(name)) {
    return false;
  }
  return true;
};

const selectGodotProjectStep = async (): Promise<FullPathFile | undefined> => {
  let res = await selectGodotProject();
  logger.info(`Trying to create project from: ${res}`);
  return res;
};

const writeCrateNameStep = async (
  godotProject: FullPathFile
): Promise<Name | undefined> => {
  let value: string = kebabCase(getParsedGodotProject(godotProject).name);
  while (true) {
    let name = await window.showInputBox({
      placeHolder: "crate name",
      title: "Enter a crate name",
      prompt: "Crate name must be snake_case or kebab-case",
      value: value,
    });
    if (name === undefined) {
      return;
    }
    if (validateCrateName(name)) {
      logger.info(`New crate name selected: ${name}`);
      return name;
    } else {
      logger.error("Fail validating crate name");
      value = name;
    }
  }
};

const selecRustParentDirStep = async (
  godotProject: FullPathDir
): Promise<FullPathDir | undefined> => {
  let res = await window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    defaultUri: Uri.file(godotProject),
    openLabel: "Choose",
    title: "Select parent folder of the new generated crate",
  });
  if (res) {
    logger.info(`New Rust crate will created inside ${res[0].fsPath}`);
    return res[0].fsPath;
  }
};

const buildCargoToml = (crateName: Name): string => {
  const godotCrate = getGodotCrateVersionAsTomlLine();
  return `[package]
name = "${crateName}"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
${godotCrate}`;
};

const buildLibRs = (crateName: Name): string => {
  let extensionName = `${pascalCase(crateName)}Extension`;
  return `use godot::prelude::*;

struct ${extensionName};

#[gdextension]
unsafe impl ExtensionLibrary for ${extensionName} {}`;
};

const getGodotCrateVersionAsTomlLine = (): string => {
  let _version: string | undefined;
  let commandRes = runCargoCommand("search godot -q --limit 1");
  if ("ok" in commandRes) {
    _version = commandRes.ok
      .split("\n")[0]
      .match(/godot\s=\s\"\d\.\d\.\d\"/)?.[0];
  } else {
    logger.warn(`Cargo command returned ${commandRes.error}`);
  }
  const result = _version || LAST_GODOT_CRATE_VERSION_AS_TOML;
  logger.info(`Using godot crate: ${result}`);
  return result;
};

// init git if none found in parent directory
const setupGit = (crateDir: FullPathDir) => {
  logger.info("Setting up git");
  let resdir: string | null = null;
  try {
    resdir = findParentDir.sync(crateDir, ".git/");
  } catch (err: any) {
    if (err.cod) {
      logger.error("An error occured setting up git, aborting setup git");
    }
  }

  if (resdir) {
    logger.info(`.git found at ${resdir}, skipping`);
  } else {
    const gitignore = path.join(crateDir, ".gitignore");
    writeFileSync(
      path.join(gitignore),
      `debug/
target/
**/*.rs.bk
*.pdb`
    );
    logger.info(`Added .gitignore to ${crateDir}`);
    logger.info("trying to init git repo");
    try {
      const res = execSync("git init", {
        encoding: "utf-8",
        timeout: 2000,
        cwd: crateDir,
      });
      logger.info(res);
    } catch (e: any) {
      logger.error(`git init failed with message:  ${e.message}`);
    }
  }
};
