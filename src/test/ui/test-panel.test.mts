import {
  InputBox,
  Menu,
  MenuItem,
  TreeItem,
  WebDriver,
} from "vscode-extension-tester";
import { initTest, pickItem } from "./ui-testutils.js";
import { expect } from "earl";
import { join } from "path";
import { readUtf8Sync } from "../../utils.js";
import { rmSync, writeFileSync } from "fs";
import { length } from "string-ts";

const child1Label = "child1.tscn (Child1)";
const child2Label = "child_2.tscn (Child2)";
describe("Test Panel", () => {
  it("global test panel", async () => {
    const { rootPath, driver, panel, godotDir, browser, wb } = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );
    let visibleItems: TreeItem[] =
      (await panel.getVisibleItems()) as TreeItem[];

    //------------------------- Base show -------------------------//

    // Affichage de base
    expect(visibleItems.length).toEqual(5);
    expect(
      await Promise.all(visibleItems.map((m, _, __) => m.getLabel()))
    ).toEqual([
      child1Label,
      child2Label,
      "main.tscn (Main)",
      "other.tscn (Other)",
      "Subsub.tscn (Esubix)",
    ]);
    expect(
      await Promise.all(visibleItems.map((m, _, __) => m.getDescription()))
    ).toEqual([
      "Child1Struct \u279c Node2D",
      "HTTPRequest",
      "Node2D",
      "Other \u279c Node2D",
      "CanvasModulate",
    ]);

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

    //------------------------- context -------------------------//
    // godotclass
    const getMenuItems = async (name: string): Promise<MenuItem[]> => {
      let item = (await pickItem(name))!;
      await item.click();
      let menu = await item?.openContextMenu()!;
      // await driver.sleep(5000);
      await menu.wait();
      let items = await menu.getItems();
      return items;
    };

    let menuItems = await getMenuItems(child1Label);
    expect(menuItems.length).toEqual(1);
    expect(await menuItems[0].getLabel()).toEqual(
      "Godot4-Rust: Change Type with GodotClass in active Editor"
    );

    // //godotscene
    menuItems = await getMenuItems(child2Label);
    expect(menuItems.length).toEqual(2);
    expect(await menuItems[1].getLabel()).toEqual(
      "Godot4-Rust: Create a new GodotClass from Godot Scene"
    );
    expect(await menuItems[0].getLabel()).toEqual(
      "Godot4-Rust: Change Type with GodotClass in active Editor"
    );
    await driver.sleep(5000);
    // // child nod

    menuItems = await getMenuItems("AA");
    expect(menuItems.length).toEqual(1);
    expect(await menuItems[0].getLabel()).toEqual(
      "Godot4-Rust: Insert OnReady field"
    );

    await pickItem(child1Label); //release

    //------------------------- interact -------------------------//

    await visibleItems[0].click();
    driver.wait(async () => {
      (await wb.getEditorView().getOpenEditorTitles()).at(0) === "Child1.rs";
    });
    await wb.getEditorView().closeAllEditors();

    //------------------------- Modify Rust -------------------------//

    expect(await (await pickItem(child1Label))!.getDescription()).toEqual(
      "Child1Struct \u279c Node2D"
    );
    let child1 = join(rootPath, "src/child_1.rs");
    let backup = readUtf8Sync(child1);

    // delete
    console.log("deleting");
    rmSync(child1);
    await waitToolTipToBe("Child1", "Rust godot class missing", driver);

    // Add
    console.log("adding");
    writeFileSync(child1, backup);
    await waitToolTipToBe(child1Label, "child1.tscn", driver);

    // Modify className
    writeFileSync(child1, backup.replaceAll("Child1Struct", "Autre1Struct"));
    await waitToolTipToBe("Child1", "Rust godot class missing", driver);
    writeFileSync(child1, backup.replaceAll("Autre1Struct", "Child1Sruct"));
    await waitToolTipToBe(child1Label, "child1.tscn", driver);

    //------------------------- Modify Godo -------------------------//

    // change root in godot
    let child1tscn = join(godotDir, "child1.tscn");
    backup = readUtf8Sync(child1tscn);
    writeFileSync(
      child1tscn,
      backup.replace('type="Child1Struct"', 'type="Sprite2D"')
    );
    await waitDescriptionToBe(child1Label, "Sprite2D", driver);
    writeFileSync(
      child1tscn,
      backup.replace('type="Child1Struct"', 'type="Other"')
    );
    await waitDescriptionToBe(child1Label, "Other \u279C Node2D", driver);
    writeFileSync(child1tscn, backup);
    await waitDescriptionToBe(
      child1Label,
      "Child1Struct \u279C Node2D",
      driver
    );

    // remove file in godot
    rmSync(child1tscn);
    await driver.sleep(300);
    await driver.wait(
      async () => (await pickItem(child1Label)) === undefined,
      2000,
      "Child 1 should be remove"
    );

    // Add File in GODOT
    writeFileSync(child1tscn, backup);
    await driver.wait(
      async () => await pickItem(child1Label),
      2000,
      "Child 1 should be back"
    );

    //------------------------- Switch class -------------------------//

    await browser.openResources(join(rootPath, "src/other.rs"));
    let child2 = (await pickItem(child2Label))!;
    await child2.select();
    await wb.executeCommand("Change Type GodotClass");
    let inp = await InputBox.create();
    await inp.selectQuickPick("child_2.tscn");
    await waitDescriptionToBe(child2Label, "Other \u279C Node2D", driver);

    const notif = (await wb.getNotifications())![0];
    expect(await notif.getMessage()).toEqual(
      "Godot Scene File has been updated"
    );
  });
});

const waitToolTipToBe = async (
  item: string,
  value: string,
  driver: WebDriver
) => {
  let was = await (await pickItem(item))!.getTooltip();
  await driver.wait(
    async () => (await (await pickItem(item))!.getTooltip()) === value,
    2000,
    `Expect error: Tooltip should be changed to: "${value}" but was "${was}"`
  );
};

const waitDescriptionToBe = async (
  item: string,
  value: string,
  driver: WebDriver
) => {
  let was = await (await pickItem(item))!.getDescription();
  await driver.wait(
    async () => (await (await pickItem(item))!.getDescription()) === value,
    2000,
    `Expect error: Description should be changed to: "${value}" but was "${was}"`
  );
};
