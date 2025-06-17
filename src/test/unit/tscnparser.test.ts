import path from "path";
import { expect } from "earl";
import { parseResFile, parseResFileSync } from "../../godot/resParser";
import { GDScene } from "../../godot/types";
import { globSync } from "glob";

describe("TSCN Parser", () => {
  it("tscn ext resource", async () => {
    let p = parseResFileSync(
      path.resolve("assets/GodotProject/Scenes/Main/main.tscn")
    );
    expect(p).toEqual(mainParsed);
  });

  it("tscn en vrac à tester + async", async () => {
    for (const c of [
      "assets/GodotProject/Scenes/Main/main2.tscn",
      "assets/bigtscn.tscn",
      ...globSync("assets/scalazar/**/*.tscn", { absolute: true }),
    ]) {
      await parseResFile(path.resolve(c));
    }
  });
});

const mainParsed: GDScene = {
  uid: "uid://dtkeetr8r8u3l",
  rootNode: {
    name: "Main",
    type: "MainScene",
    kind: "node",
  },
  extResources: [
    {
      type: "Texture2D",
      uid: "uid://dycv01s4vud8g",
      path: "res://assets/Gray.png",
      id: "1_lixft",
      kind: "ext_resource",
    },
    {
      type: "LabelSettings",
      uid: "uid://b0kponm3gbkqq",
      path: "res://Resources/MainTitleFont.tres",
      id: "2_qw60k",
      kind: "ext_resource",
    },
    {
      type: "PackedScene",
      uid: "uid://jt3wvha7tsv3",
      path: "res://Scenes/Main/LevelButton/level_button.tscn",
      id: "3_qw60k",
      kind: "ext_resource",
    },
    {
      type: "Script",
      path: "res://world.gd",
      id: "1_kk187",
      uid: "uid://blabla",
      kind: "ext_resource",
    },
  ],
  subResources: [
    {
      kind: "sub_resource",
      id: "Environment_efmn2",
      type: "Environment",
    },
  ],
  nodes: [
    {
      name: "TextureRect",
      type: "TextureRect",
      parent: ".",
      kind: "node",
    },
    {
      name: "MC",
      type: "MarginContainer",
      parent: ".",
      kind: "node",
    },
    {
      name: "VB",
      type: "VBoxContainer",
      parent: "MC",
      kind: "node",
    },
    {
      name: "Label",
      type: "Label",
      parent: "MC/VB",
      kind: "node",
    },
    {
      name: "Grid",
      type: "GridContainer",
      parent: "MC/VB",
      kind: "node",
    },
    {
      name: "Lev",
      parent: ".",
      instance: "3_qw60k",
      kind: "node",
      resource: {
        type: "PackedScene",
        uid: "uid://jt3wvha7tsv3",
        path: "res://Scenes/Main/LevelButton/level_button.tscn",
        id: "3_qw60k",
        kind: "ext_resource",
      },
    },
    {
      name: "Level",
      type: "Level",
      parent: ".",
      kind: "node",
    },
  ],
};
