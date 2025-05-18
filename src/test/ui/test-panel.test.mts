import { TreeItem } from "vscode-extension-tester";
import { initPanel, initTest } from "./ui-testutils.js";
import { expect } from "earl";

describe("Testing pan", () => {
  it("test panel load", async () => {
    const { rootPath, driver } = await initTest(
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
    ).toEqual(["Child1Struct", "HTTPRequest", "Node2D", "Other"]);

    // click
    await visibleItems[2].click();
    let aa = (await panel.findItem("AA")) as TreeItem;
    expect(await aa.isExpanded()).toBeTruthy();
    let aab = (await panel.findItem("AAB")) as TreeItem;
    expect(await aab.isExpandable()).toBeTruthy();
    expect(await aa.hasChildren()).toBeTruthy();
    expect(await aab.hasChildren()).toBeFalsy();
    const children = await aa.getChildren();
    expect(await children.at(1)?.getLabel()).toEqual(await aab.getLabel());
  });
});
