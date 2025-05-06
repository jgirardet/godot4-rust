import { GODOT_PROJECT_FILEPATH_KEY } from "../constantes";
import { getConfigValue, getGodotProjectPath } from "../utils";
import path from "path";
import { logger } from "../log";
import { readFile } from "fs/promises";
import * as ini from "ini";
import { getRustDir, getCrateName, getCargoToml } from "../cargo.js";
import { window } from "vscode";
import { writeFileSync, existsSync } from "fs";

export const createGdextensionCommand = async () => {
  logger.info("Starting command: create gdextension file");

  // setup dirs
  let cargoToml = await getCargoToml();
  if (cargoToml === undefined) {
    logger.error("No Cargo.toml found, aborting");
    return;
  }
  const rustDir = await getRustDir(cargoToml);
  const godotDir = getGodotProjectPath();
  logger.info(`Using ${godotDir}`);

  // deal with the names
  let crateName = getCrateName(cargoToml);
  let extFilename = `${crateName}.gdextension`;
  let secondExtFilename = `new_${extFilename}`;
  let newPath = path.join(godotDir, extFilename);
  if (existsSync(newPath)) {
    let resp: string | undefined = await window.showInformationMessage(
      `A file named "${extFilename}" already exists in ${godotDir}`,
      { modal: true },
      "Overwrite",
      `Name the new one ${secondExtFilename}`
    );
    if (resp === undefined) {
      logger.info("Alredy exists cancelling");
      return;
    } else if (resp.includes(secondExtFilename)) {
      extFilename = secondExtFilename;
      newPath = path.join(godotDir, extFilename);
    }
  }

  // generate and write to disk
  const gdContent = await gdText(rustDir, crateName);
  writeFileSync(newPath, gdContent);
  window.showInformationMessage(`${extFilename} created`);
};

const gdText = async (rustDir: string, crateName: string, version?: string) => {
  const godotDir = getGodotProjectPath();
  const godotFile = getConfigValue(GODOT_PROJECT_FILEPATH_KEY);
  let _version;
  if (version === undefined) {
    let text = await readFile(godotFile, {
      encoding: "utf-8",
    });
    let project = ini.parse(text);
    _version =
      (project["application"]["config/features"] as string)
        .match(/.*(\d\.\d).*/)
        ?.at(1) ?? "4.2";
  } else {
    _version = version;
  }
  logger.info(`Creating gdextension file with compatibility ${_version}`);
  const relativeRustDir = path
    .relative(godotDir, rustDir)
    .replaceAll("\\", "/"); // win32 hack
  crateName = crateName.replaceAll("-", "_"); // changed by rust when buildind

  return `[configuration]
entry_symbol = "gdext_rust_init"
compatibility_minimum = ${_version}
reloadable = true

[libraries]
linux.debug.x86_64 =     "res://${relativeRustDir}/target/debug/lib${crateName}.so"
linux.release.x86_64 =   "res://${relativeRustDir}/target/release/lib${crateName}.so"
windows.debug.x86_64 =   "res://${relativeRustDir}/target/debug/${crateName}.dll"
windows.release.x86_64 = "res://${relativeRustDir}/target/release/${crateName}.dll"
macos.debug =            "res://${relativeRustDir}/target/debug/lib${crateName}.dylib"
macos.release =          "res://${relativeRustDir}/target/release/lib${crateName}.dylib"
macos.debug.arm64 =      "res://${relativeRustDir}/target/debug/lib${crateName}.dylib"
macos.release.arm64 =    "res://${relativeRustDir}/target/release/lib${crateName}.dylib"`;
};
