import { readFileSync } from "fs";
import path from "path";
import { TscnParser } from "../../godot/parser";
import { expect } from "earl";

describe("TSCN Parser", () => {
  describe("Full parse", () => {
    it("tscn ext resource", () => {
      let p = new TscnParser(
        readFileSync(
          path.resolve("assets/GodotProject/Scenes/Main/main.tscn"),
          { encoding: "utf-8" }
        )
      );
      let res = p.getExtResources();

      expect(res).toEqual(extRes);
    });

    it("tscn node", () => {
      let p = new TscnParser(
        readFileSync(
          path.resolve("assets/GodotProject/Scenes/Main/main.tscn"),
          { encoding: "utf-8" }
        )
      );
      p.getExtResources();
      expect(p.getNodes()).toEqual(nodes);
    });
    it("tscn gscene", () => {
      let p = new TscnParser(
        readFileSync(
          path.resolve("assets/GodotProject/Scenes/Main/main.tscn"),
          { encoding: "utf-8" }
        )
      );
      let scene = p.parse();
      expect(scene.uid).toEqual("uid://dtkeetr8r8u3l");
      expect(scene.extResources).toEqual(extRes);
      expect(scene.nodes).toEqual(nodes);
    });
  });
});

const extRes = [
  {
    type: {
      startPosition: { row: 2, column: 19 },
      endPosition: { row: 2, column: 30 },
      value: "Texture2D",
    },
    uid: {
      startPosition: { row: 2, column: 35 },
      endPosition: { row: 2, column: 56 },
      value: "uid://dycv01s4vud8g",
    },
    path: {
      startPosition: { row: 2, column: 62 },
      endPosition: { row: 2, column: 85 },
      value: "res://assets/Gray.png",
    },
    id: {
      startPosition: { row: 2, column: 89 },
      endPosition: { row: 2, column: 98 },
      value: "1_lixft",
    },
  },
  {
    type: {
      startPosition: { row: 3, column: 19 },
      endPosition: { row: 3, column: 34 },
      value: "LabelSettings",
    },
    uid: {
      startPosition: { row: 3, column: 39 },
      endPosition: { row: 3, column: 60 },
      value: "uid://b0kponm3gbkqq",
    },
    path: {
      startPosition: { row: 3, column: 66 },
      endPosition: { row: 3, column: 102 },
      value: "res://Resources/MainTitleFont.tres",
    },
    id: {
      startPosition: { row: 3, column: 106 },
      endPosition: { row: 3, column: 115 },
      value: "2_qw60k",
    },
  },
  {
    type: {
      startPosition: { row: 4, column: 19 },
      endPosition: { row: 4, column: 32 },
      value: "PackedScene",
    },
    uid: {
      startPosition: { row: 4, column: 37 },
      endPosition: { row: 4, column: 57 },
      value: "uid://jt3wvha7tsv3",
    },
    path: {
      startPosition: { row: 4, column: 63 },
      endPosition: { row: 4, column: 112 },
      value: "res://Scenes/Main/LevelButton/level_button.tscn",
    },
    id: {
      startPosition: { row: 4, column: 116 },
      endPosition: { row: 4, column: 125 },
      value: "3_qw60k",
    },
  },
];

const nodes = [
  {
    type: {
      startPosition: { row: 7, column: 23 },
      endPosition: { row: 7, column: 34 },
      value: "MainScene",
    },
    name: {
      startPosition: { row: 7, column: 11 },
      endPosition: { row: 7, column: 17 },
      value: "Main",
    },
  },
  {
    type: {
      startPosition: { row: 14, column: 30 },
      endPosition: { row: 14, column: 43 },
      value: "TextureRect",
    },
    name: {
      startPosition: { row: 14, column: 11 },
      endPosition: { row: 14, column: 24 },
      value: "TextureRect",
    },
    parent: {
      startPosition: { row: 14, column: 51 },
      endPosition: { row: 14, column: 54 },
      value: ".",
    },
  },
  {
    type: {
      startPosition: { row: 24, column: 21 },
      endPosition: { row: 24, column: 38 },
      value: "MarginContainer",
    },
    name: {
      startPosition: { row: 24, column: 11 },
      endPosition: { row: 24, column: 15 },
      value: "MC",
    },
    parent: {
      startPosition: { row: 24, column: 46 },
      endPosition: { row: 24, column: 49 },
      value: ".",
    },
  },
  {
    type: {
      startPosition: { row: 36, column: 21 },
      endPosition: { row: 36, column: 36 },
      value: "VBoxContainer",
    },
    name: {
      startPosition: { row: 36, column: 11 },
      endPosition: { row: 36, column: 15 },
      value: "VB",
    },
    parent: {
      startPosition: { row: 36, column: 44 },
      endPosition: { row: 36, column: 48 },
      value: "MC",
    },
  },
  {
    type: {
      startPosition: { row: 39, column: 11 },
      endPosition: { row: 39, column: 18 },
      value: "Label",
    },
    name: {
      startPosition: { row: 39, column: 24 },
      endPosition: { row: 39, column: 31 },
      value: "Label",
    },
    parent: {
      startPosition: { row: 39, column: 39 },
      endPosition: { row: 39, column: 46 },
      value: "MC/VB",
    },
  },
  {
    type: {
      startPosition: { row: 46, column: 23 },
      endPosition: { row: 46, column: 38 },
      value: "GridContainer",
    },
    name: {
      startPosition: { row: 46, column: 11 },
      endPosition: { row: 46, column: 17 },
      value: "Grid",
    },
    parent: {
      startPosition: { row: 46, column: 46 },
      endPosition: { row: 46, column: 53 },
      value: "MC/VB",
    },
  },
  {
    name: {
      startPosition: { row: 51, column: 11 },
      endPosition: { row: 51, column: 16 },
      value: "Lev",
    },
    parent: {
      startPosition: { row: 51, column: 24 },
      endPosition: { row: 51, column: 27 },
      value: ".",
    },
    instance: {
      value: {
        type: {
          startPosition: { row: 4, column: 19 },
          endPosition: { row: 4, column: 32 },
          value: "PackedScene",
        },
        uid: {
          startPosition: { row: 4, column: 37 },
          endPosition: { row: 4, column: 57 },
          value: "uid://jt3wvha7tsv3",
        },
        id: {
          startPosition: { row: 4, column: 116 },
          endPosition: { row: 4, column: 125 },
          value: "3_qw60k",
        },
        path: {
          startPosition: { row: 4, column: 63 },
          endPosition: { row: 4, column: 112 },
          value: "res://Scenes/Main/LevelButton/level_button.tscn",
        },
      },
      startPosition: { row: 51, column: 28 },
      endPosition: { row: 51, column: 59 },
    },
  },
  {
    type: {
      startPosition: { row: 56, column: 24 },
      endPosition: { row: 56, column: 31 },
      value: "Level",
    },
    name: {
      startPosition: { row: 56, column: 11 },
      endPosition: { row: 56, column: 18 },
      value: "Level",
    },
    parent: {
      startPosition: { row: 56, column: 39 },
      endPosition: { row: 56, column: 42 },
      value: ".",
    },
  },
];
