import {
  BottomBarPanel,
  InputBox,
  OutputView,
  SideBarView,
  TreeItem,
  ViewItem,
  VSBrowser,
  WebDriver,
  Workbench,
} from "vscode-extension-tester";
import { cloneGrudotDirTemp, initTest } from "../testutils.js";
import { DISPLAY_NAME, NAME } from "../../constantes.js";
import { expect } from "earl";
import path from "path";

describe("create gdextension file", () => {
  let browser: VSBrowser;
  let driver: WebDriver;
  let wb: Workbench;
  let rootPath: string;
  let inp: InputBox;
  let bottomBar: BottomBarPanel;
  let outputView: OutputView;

  let godotDir: string;
  let crateName: string;
  let gdextension: string;

  beforeEach(async () => {});

  it("test panel load", async () => {
    [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );

    let panel = await initPanel(rootPath, driver);

    let visibleItems: TreeItem[] =
      (await panel.getVisibleItems()) as TreeItem[];

    // Affichage de base
    expect(visibleItems.length).toEqual(4);
    expect(
      await Promise.all(visibleItems.map((m, _, __) => m.getLabel()))
    ).toEqual(["Child1", "Child2", "Main", "Other"]);
    expect(
      await Promise.all(visibleItems.map((m, _, __) => m.getDescription()))
    ).toEqual(["Child1", "HTTPRequest", "Node2D", "Node2D"]);

    // click
    await visibleItems[2].click();
    let aa = (await panel.findItem("AA")) as TreeItem;
    expect(await aa.isExpanded()).toBeTruthy();
    let aab = (await panel.findItem("AAB")) as TreeItem;
    expect(await aab.isExpandable()).toBeFalsy();
    expect(await aa.hasChildren()).toBeTruthy();
    expect(await aab.hasChildren()).toBeFalsy();
    expect((await aa.getChildren())[1]).toEqual(aa);
  });
  // it("test reveal", async () => {
  //   [rootPath, browser, driver, wb, bottomBar, outputView] = await initTest(
  //     "assets/ConfigProject"
  //   );
  //   let panel = await initPanel(rootPath, driver);
  //   wb.executeCommand(`${NAME}.reveal`);
  // });
});

const initPanel = async (rootPath: string, driver: WebDriver) => {
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
