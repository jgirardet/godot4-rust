import { expect } from "earl";
import { cloneGrudotDirTemp } from "../testutils";
import { globSync } from "glob";
import path from "path";
import { GodotScene } from "../../godot/godotScene";
import { GodotPath, gp } from "../../godot/godotPath";
import { GodotManager } from "../../godot/godotManager";
import { GDScene } from "../../godot/types";
import { includes } from "string-ts";
import { child } from "winston";

const dep = (file: string): string => path.resolve("assets/depedencies", file);

describe("Test Godot Watcher", () => {
  it("test eq godotpath", () => {
    let a = gp("un");
    let b = gp("un");
    let c = gp("on");
    expect(a.eq(b)).toEqual(true);
    expect(a.eq(c)).toEqual(false);
    expect([a, b, c].includes(a)).toEqual(true);
  });
  it("test new GodotScene and depedencies", async () => {
    let gs = await GodotScene.new(
      path.resolve(dep("main.tscn")),
      path.resolve(dep(""))
    );
    expect(gs.uid).toEqual("uid://budmhkgm4nb6f");
    expect(gs.depedencies).toEqual([
      new GodotPath("child1.tscn"),
      new GodotPath("child2.tscn"),
      new GodotPath("child22.tscn"),
    ]);
  });

  it("test load all scenes of a project", async () => {
    let gm = new GodotManager(dep("project.godot"));
    let res = await gm.load();
    expect(res.length).toEqual(7);
    expect(gm.scenes.size).toEqual(7);

    const sortFn = (a: GodotScene, b: GodotScene) => (a.uid > b.uid ? 1 : -1);
    res.sort(sortFn);
    let sceneValues = [...gm.scenes.values()];
    sceneValues.sort(sortFn);
    expect(res).toEqual(sceneValues);
  });

  it("test onchange no dep", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    let change = await gm.onChange(dep("main.tscn"));
    expect(change.map((x) => x.path.base)).toEqual(["main.tscn"]);
  });

  it("test onchange 1 seul dependance", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    let change = await gm.onChange(dep("child1.tscn"));
    expect(change.map((x) => x.path.base)).toEqual([
      "child1.tscn",
      "main.tscn",
    ]);
  });

  it("test onchange plsuieurs dépendances", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    let change = await gm.onChange(dep("child2.tscn"));
    console.log(gm.dependencies);
    expect(change.map((x) => x.path.base)).toEqualUnsorted([
      "child2.tscn",
      "main.tscn",
      "child111.tscn",
      "child11.tscn",
      "child1.tscn",
    ]);
  });

  it("test onchange delete", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    let change = await gm.onChange(dep("child2.tscn"), true);
    expect(change.map((x) => x.path.base)).toEqualUnsorted([
      "main.tscn",
      "child111.tscn",
      "child11.tscn",
      "child1.tscn",
    ]);
    expect(gm.scenes.get("child2.tscn")).toBeNullish();
  });

  it("test should not readd dependency anytime", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    let bm = new GodotManager(dep("project.godot"));
    await bm.load();
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    await gm.onChange(dep("child2.tscn"));
    let change = await gm.onChange(dep("child2.tscn"));
    let change2 = await bm.onChange(dep("child2.tscn"));
    expect(change).toEqualUnsorted(change2);
    console.log(gm.cont);
    // console.log(gm.cont);
    // expect(change).toEqual(change2);

    // expect(change.map((x) => x.path.base)).toEqualUnsorted([
    //   "main.tscn",
    //   "child111.tscn",
    //   "child11.tscn",
    //   "child1.tscn",
    // ]);
    // expect(gm.scenes.get("child2.tscn")).toBeNullish();
  });
});
