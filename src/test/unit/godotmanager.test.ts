import { expect } from "earl";
import path from "path";
import { GodotScene } from "../../godot/godotScene";
import { GodotPath, gp } from "../../godot/godotPath";
import { GodotManager } from "../../godot/godotManager";

const godotdir = path.resolve("assets/depedencies");
const dep = (file: string): string => path.join(godotdir, file);

describe("Test Godomanager Scenes", () => {
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
    await gm.load();
    expect(gm.scenes.size).toEqual(7);
  });

  it("test load all scenes of a project", async () => {
    let gm = new GodotManager(dep("project.godot"));
    let res = await gm.load();
    expect(gm.scenes.size).toEqual(7);
  });
});

describe("on change godotmanager", () => {
  it("test onchange no dep", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    gm.scenes.set("main.tscn", gm.scenes.get("child1.tscn")!);
    await gm.onChange(dep("main.tscn"));
    expect(gm.scenes.get("main.tscn")?.path.base).toEqual("main.tscn");
    expect(gm.lastUpdate.map((x) => path.basename(x))).toEqualUnsorted([
      "main.tscn",
    ]);
  });
  it("test onchange 1 seul dependance", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    gm.scenes.set("main.tscn", gm.scenes.get("child2.tscn")!);
    gm.scenes.set("child1.tscn", gm.scenes.get("child111.tscn")!);
    await gm.onChange(dep("child1.tscn"));
    expect(gm.scenes.get("main.tscn")?.path.base).toEqual("main.tscn");
    expect(gm.scenes.get("child1.tscn")?.path.base).toEqual("child1.tscn");
    expect(gm.lastUpdate.map((x) => path.basename(x))).toEqualUnsorted([
      "main.tscn",
      "child1.tscn",
    ]);
  });
  it("test onchange plsuieurs dépendances", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    await gm.onChange(dep("child2.tscn"));
    // console.log(gm.dependencies);
    expect(gm.lastUpdate.map((x) => path.basename(x))).toEqualUnsorted([
      "child2.tscn",
      "main.tscn",
      "child111.tscn",
      "child11.tscn",
      "child1.tscn",
    ]);
  });
  it("test should depeencies are updated, add anytime", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    let bm = new GodotManager(dep("project.godot"));
    await bm.load();
    [Array(3).keys()].forEach(async (_) => {
      await gm.onChange(dep("child2.tscn"));
    });
    expect(gm.scenes).toEqual(bm.scenes);
    expect(gm.dependencies).toEqual(bm.dependencies);
  });
});

describe("delete item", () => {
  it("test onchange delete", async () => {
    let gm = new GodotManager(dep("project.godot"));
    await gm.load();
    await gm.onChange(dep("child2.tscn"), true);
    expect(gm.lastUpdate).toEqualUnsorted([
      "main.tscn",
      "child111.tscn",
      "child11.tscn",
      "child1.tscn",
    ]);
    expect(gm.scenes.get("child2.tscn")).toBeNullish();
  });
});
