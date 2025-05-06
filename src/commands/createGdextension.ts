import path from "path";
import { logger } from "../log";
import { getRustDir, getCrateName, getCargoToml } from "../cargo.js";
import { window } from "vscode";
import { writeFileSync, existsSync } from "fs";
import {
  getGodotProjectDir,
  getGodotProjectFile,
  getParsedGodotProject,
} from "../godotProject";
import { FullPathDir, FullPathFile, Name } from "../types";

export const createGdextensionCommand = async () => {
  logger.info("Starting command: create gdextension file");

  // setup dirs
  let cargoToml = await getCargoToml();
  if (cargoToml === undefined) {
    logger.error("No Cargo.toml found, aborting");
    return;
  }
  const rustDir = await getRustDir(cargoToml);
  let crateName = getCrateName(cargoToml);
  const gfp = getGodotProjectFile();

  let fileExtensionName = await processCreateGdextension(
    crateName,
    rustDir,
    gfp
  );
  window.showInformationMessage(`${fileExtensionName} created`);
};

export const processCreateGdextension = async (
  crateName: Name,
  rustDir: FullPathDir,
  gfp: FullPathFile
): Promise<string | undefined> => {
  let godotDir = getGodotProjectDir(gfp);
  logger.info(`Using ${godotDir}`);
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
  const gdContent = await gdText(rustDir, crateName, gfp);
  writeFileSync(newPath, gdContent);
  return extFilename;
};

const gdText = async (
  rustDir: string,
  crateName: string,
  gfp: FullPathFile,
  version?: string
) => {
  const godotDir = getGodotProjectDir(gfp);
  let _version = version || getParsedGodotProject(gfp).version;
  logger.info(`Creating gdextension file with compatibility ${_version}`);
  const relativeRustDir = path
    .relative(godotDir, rustDir)
    .replaceAll("\\", "/"); //win32 hack
  crateName = crateName.replaceAll("-", "_"); // changed by rust when build

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
