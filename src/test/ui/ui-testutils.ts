import path from "path";
import { DISPLAY_NAME, GodotSettings, NAME } from "../../constantes";
import * as fs from "fs";
import * as os from "os";
import { glob } from "glob";
import {
  BottomBarPanel,
  InputBox,
  OutputView,
  SideBarView,
  TreeItem,
  ViewSection,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { existsSync } from "fs";
import { readUtf8Sync } from "../../utils";
import { addGodotProjectPathSetting, cloneDirToTemp } from "../common";

export const initTest = async (
  rustbase: string = "assets/noConfigProject",
  godotbase: string = "assets/GodotProject"
): Promise<InitTest> => {
  let rootPath = cloneDirToTemp(rustbase);
  let godotDir = cloneDirToTemp(godotbase);
  addGodotProjectPathSetting(rootPath, godotDir);
  console.log(`rootPath: ${rootPath}`);
  console.log(`godotPath: ${godotDir}`);
  let browser = VSBrowser.instance;
  await browser.openResources(rootPath);
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
  let panel = await initPanel(rootPath, driver);
  return {
    rootPath,
    browser,
    driver,
    wb,
    bottomBar,
    outputView,
    godotDir,
    panel,
  };
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
export const fileExistsAsync = async (
  fp: string,
  driver: WebDriver,
  timeout: number = 2000
) => {
  const waitTime = 100;
  let counter = 0;
  console.log(`Waiting for ${fp}`);
  await driver.wait(async () => {
    if (existsSync(fp)) {
      return true;
    }
    if (counter >= timeout) {
      throw new Error(`timeout waiting ${fp}`);
    }
    await driver.sleep(waitTime);
    counter += waitTime;
  });
  return true;
};

export const selectPath = async (fullpath: string) => {
  const input = await InputBox.create();
  await input.setText(fullpath);
  await input.confirm();
};

const clearTmp = async () => {
  for (let d of await glob(`${os.tmpdir()}/grudot*`)) {
    fs.rmSync(d, { recursive: true, force: true });
  }
  // fs.rmSync(".test-extensions", { recursive: true, force: true });
};

export const initPanel = async (rootPath: string, driver: WebDriver) => {
  let explorer = await new SideBarView()
    .getContent()
    .getSection(path.basename(rootPath));
  await explorer.collapse();
  let panel = await new SideBarView().getContent().getSection(DISPLAY_NAME);
  await panel.expand();
  await driver.wait(
    async () => (await panel.getVisibleItems()).length > 0,
    5000
  );
  return panel;
};

export const pickItem = async (
  item: number | string,
  panel?: ViewSection
): Promise<TreeItem | undefined> => {
  panel =
    panel || (await new SideBarView().getContent().getSection(DISPLAY_NAME));
  let items: TreeItem[] = (await panel.getVisibleItems()) as TreeItem[];
  if (typeof item === "number") {
    return items[0];
  } else {
    for (const i of items) {
      if ((await i.getLabel()) === item) {
        return i;
      }
    }
  }
  return;
};

export interface InitTest {
  rootPath: string;
  browser: VSBrowser;
  driver: WebDriver;
  wb: Workbench;
  bottomBar: BottomBarPanel;
  outputView: OutputView;
  godotDir: string;
  panel: ViewSection;
}

clearTmp();
