import { TreeItem, WebDriver } from "vscode-extension-tester";
import { initTest, pickItem } from "./ui-testutils.js";
import { expect } from "earl";
import { join } from "path";
import { readUtf8Sync } from "../../utils.js";
import { rmSync, writeFileSync } from "fs";

describe("Testing pan", () => {
  it("test panel load", async () => {
    const { rootPath, driver, panel, godotDir } = await initTest(
      "assets/panel/panel",
      "assets/panel"
    );

    let visibleItems: TreeItem[] =
      (await panel.getVisibleItems()) as TreeItem[];

    //------------------------- Base show -------------------------//

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

    //------------------------- Modify Rust -------------------------//

    expect(await (await pickItem("Child1"))!.getDescription()).toEqual(
      "Child1Struct"
    );
    let child1 = join(rootPath, "src/child_1.rs");
    let backup = readUtf8Sync(child1);

    // delete
    rmSync(child1);
    await waitToolTipToBe("Error: type is missing", driver);

    // Add
    writeFileSync(child1, backup);
    await waitToolTipToBe("Child1Struct", driver);

    // Modify className
    writeFileSync(child1, backup.replaceAll("Child1Struct", "Autre1Struct"));
    await waitToolTipToBe("Error: type is missing", driver);
    writeFileSync(child1, backup.replaceAll("Autre1Struct", "Child1Sruct"));
    await waitToolTipToBe("Child1Struct", driver);

    //------------------------- Modify Godo -------------------------//

    // change root in godot
    let child1tscn = join(godotDir, "child1.tscn");
    backup = readUtf8Sync(child1tscn);
    writeFileSync(
      child1tscn,
      backup.replace('type="Child1Struct"', 'type="Sprite2D"')
    );
    await waitDescriptionToBe("Sprite2D", driver);
    writeFileSync(
      child1tscn,
      backup.replace('type="Child1Struct"', 'type="Other"')
    );
    await waitDescriptionToBe("Other", driver);
    writeFileSync(child1tscn, backup);
    await waitDescriptionToBe("Child1Struct", driver);

    // remove file in godot
    rmSync(child1tscn);
    await driver.sleep(300);
    console.log(await pickItem("Child1"));
    await driver.wait(
      async () => (await pickItem("Child1")) === undefined,
      2000,
      "Child 1 should be remove"
    );

    // Add File in GODOT
    writeFileSync(child1tscn, backup);
    await driver.wait(
      async () => await pickItem("Child1"),
      2000,
      "Child 1 should be back"
    );
  });
});

const waitToolTipToBe = async (value: string, driver: WebDriver) => {
  let was = await (await pickItem("Child1"))!.getTooltip();
  await driver.wait(
    async () => (await (await pickItem("Child1"))!.getTooltip()) === value,
    2000,
    `Expect error: Tooltip should be changed to: "${value}" but was "${was}"`
  );
};

const waitDescriptionToBe = async (value: string, driver: WebDriver) => {
  let was = await (await pickItem("Child1"))!.getTooltip();
  await driver.wait(
    async () => (await (await pickItem("Child1"))!.getDescription()) === value,
    2000,
    `Expect error: Description should be changed to: "${value}" but was "${was}"`
  );
};
