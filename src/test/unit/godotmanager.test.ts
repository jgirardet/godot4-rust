import { expect } from "earl";
import path from "path";
import { GodotScene } from "../../godot/godotScene";
import { GodotPath, gp } from "../../godot/godotPath";
import { GodotManager } from "../../godot/godotManager";

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
    await gm.load();
    expect(gm.scenes.size).toEqual(7);
  });

  it("test load all scenes of a project", async () => {
    let gm = new GodotManager(dep("project.godot"));
    let res = await gm.load();
    expect(gm.scenes.size).toEqual(7);
  });
});
