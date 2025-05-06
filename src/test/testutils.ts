import path from "path";
import { GodotSettings } from "../constantes";
import * as fs from "fs";
import * as os from "os";
import { glob } from "glob";
import {
  BottomBarPanel,
  InputBox,
  OutputView,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { existsSync } from "fs";

export const cloneDirToTemp = (dirpath: string): string => {
  let tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grudot"));
  fs.cpSync(dirpath, tmp, { recursive: true });
  return tmp;
};

export const cloneGrudotDirTemp = (dirpath?: string): string => {
  dirpath = dirpath ?? "assets/GodotProject";
  let tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grudotproject"));
  fs.cpSync(dirpath, tmp, { recursive: true });
  return tmp;
};

export const addGodotProjectPathSetting = (
  projectPath: string,
  godotProjectDir?: string
) => {
  let dotvscode = path.resolve(projectPath, ".vscode");
  godotProjectDir = godotProjectDir ?? path.resolve("assets/GodotProject");
  let godotProject = path.join(godotProjectDir, "project.godot");
  if (!fs.existsSync(dotvscode)) {
    fs.mkdirSync(dotvscode);
  }
  console.log(`Using: ${dotvscode}`);
  let setting = {
    "godot4-rust.godotProjectFilePath": godotProject,
  };
  fs.writeFileSync(
    path.resolve(projectPath, ".vscode/settings.json"),
    JSON.stringify(setting)
  );
};

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

export const initTest = async (): Promise<
  [string, VSBrowser, WebDriver, Workbench, BottomBarPanel, OutputView]
> => {
  let rootPath = cloneDirToTemp("assets/noConfigProject");
  addGodotProjectPathSetting(rootPath);
  let browser = VSBrowser.instance;
  browser.openResources(rootPath);
  let driver = browser.driver;
  await browser.waitForWorkbench();
  let wb = new Workbench();
  let bottomBar = new BottomBarPanel();
  await browser.waitForWorkbench(500);
  await bottomBar.toggle(true);
  let outputView = await bottomBar.openOutputView();
  await driver.wait(async () => {
    outputView = await bottomBar.openOutputView();
    if ((await outputView.getChannelNames()).includes("Godot4 Rust")) {
      return true;
    }
  });
  await outputView.selectChannel("Godot4 Rust");
  return [rootPath, browser, driver, wb, bottomBar, outputView];
};

export const multiSelect = async (
  inp: InputBox,
  idxOrNames: string[] | number[]
) => {
  if (idxOrNames.length === 0) {
    throw new Error("Multiselect must not be empty");
  }
  let boxes = await inp.getCheckboxes();
  for (let b of boxes) {
    let checked = await b.isSelected();
    let toCheck: boolean;
    if (typeof idxOrNames[0] === "string") {
      toCheck = (idxOrNames as string[]).includes(await b.getLabel());
    } else {
      toCheck = (idxOrNames as number[]).includes(b.getIndex());
    }
    if (checked !== toCheck) {
      await b.click();
    }
  }
};
export const fileExistsAsync = async (fp: string, driver: WebDriver) => {
  let counter = 0;
  await driver.wait(async () => {
    if (existsSync(fp)) {
      return true;
    }
    if (counter === 10) {
      return;
    }
    await driver.sleep(100);
    counter += 1;
  });
  return true;
};

const clearTmp = async () => {
  for (let d of await glob(`${os.tmpdir()}/grudot*`)) {
    fs.rmSync(d, { recursive: true, force: true });
  }
  // fs.rmSync(".test-extensions", { recursive: true, force: true });
};

clearTmp();
