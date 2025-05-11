import { readFileSync } from "fs";
import path from "path";
import { TscnParser } from "../../godot/parser";
import { expect } from "earl";

describe("TSCN Parser", () => {
  it("tscn ext resource", async () => {
    let p = await TscnParser.file(
      path.resolve("assets/GodotProject/Scenes/Main/main.tscn")
    );
    let res = p.getExtResources();
    expect(res).toEqual(extRes);
  });

  it("tscn node", async () => {
    let p = await TscnParser.file(
      path.resolve("assets/GodotProject/Scenes/Main/main.tscn")
    );
    p.getExtResources();
    expect(p.getNodes()).toEqual(nodes);
  });
  it("tscn gscene", async () => {
    let p = await TscnParser.file(
      path.resolve("assets/GodotProject/Scenes/Main/main.tscn")
    );
    let scene = p.parse();
    expect(scene.uid).toEqual("uid://dtkeetr8r8u3l");
    expect(scene.extResources).toEqual(extRes);
    expect(scene.nodes.filter((m) => m.name.value === "Label").length).toEqual(
      1
    );
    expect(scene.nodes.filter((m) => m.name.value === "VB").length).toEqual(1);
    expect(scene.nodes).toEqual(nodes);
  });
  it("tscn en vrac à tester", async () => {
    for (const c of [
      "assets/GodotProject/Scenes/Main/main2.tscn",
      "assets/bigtscn.tscn",
    ]) {
      let p = await TscnParser.file(path.resolve(c));
      p.parse();
    }
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
    name: {
      startPosition: {
        row: 7,
        column: 11,
      },
      endPosition: {
        row: 7,
        column: 17,
      },
      value: "Main",
    },
    type: {
      startPosition: {
        row: 7,
        column: 23,
      },
      endPosition: {
        row: 7,
        column: 34,
      },
      value: "MainScene",
    },
  },
  {
    name: {
      startPosition: {
        row: 14,
        column: 11,
      },
      endPosition: {
        row: 14,
        column: 24,
      },
      value: "TextureRect",
    },
    type: {
      startPosition: {
        row: 14,
        column: 30,
      },
      endPosition: {
        row: 14,
        column: 43,
      },
      value: "TextureRect",
    },
    parent: {
      startPosition: {
        row: 14,
        column: 51,
      },
      endPosition: {
        row: 14,
        column: 54,
      },
      value: ".",
    },
  },
  {
    name: {
      startPosition: {
        row: 24,
        column: 11,
      },
      endPosition: {
        row: 24,
        column: 15,
      },
      value: "MC",
    },
    type: {
      startPosition: {
        row: 24,
        column: 21,
      },
      endPosition: {
        row: 24,
        column: 38,
      },
      value: "MarginContainer",
    },
    parent: {
      startPosition: {
        row: 24,
        column: 46,
      },
      endPosition: {
        row: 24,
        column: 49,
      },
      value: ".",
    },
  },
  {
    name: {
      startPosition: {
        row: 36,
        column: 11,
      },
      endPosition: {
        row: 36,
        column: 15,
      },
      value: "VB",
    },
    type: {
      startPosition: {
        row: 36,
        column: 21,
      },
      endPosition: {
        row: 36,
        column: 36,
      },
      value: "VBoxContainer",
    },
    parent: {
      startPosition: {
        row: 36,
        column: 44,
      },
      endPosition: {
        row: 36,
        column: 48,
      },
      value: "MC",
    },
  },
  {
    name: {
      endPosition: {
        column: 18,
        row: 39,
      },
      startPosition: {
        column: 11,
        row: 39,
      },
      value: "Label",
    },
    parent: {
      endPosition: {
        column: 46,
        row: 39,
      },
      startPosition: {
        column: 39,
        row: 39,
      },
      value: "MC/VB",
    },
    type: {
      endPosition: {
        column: 31,
        row: 39,
      },
      startPosition: {
        column: 24,
        row: 39,
      },
      value: "Label",
    },
  },
  {
    name: {
      startPosition: {
        row: 46,
        column: 11,
      },
      endPosition: {
        row: 46,
        column: 17,
      },
      value: "Grid",
    },
    type: {
      startPosition: {
        row: 46,
        column: 23,
      },
      endPosition: {
        row: 46,
        column: 38,
      },
      value: "GridContainer",
    },
    parent: {
      startPosition: {
        row: 46,
        column: 46,
      },
      endPosition: {
        row: 46,
        column: 53,
      },
      value: "MC/VB",
    },
  },
  {
    name: {
      startPosition: {
        row: 51,
        column: 11,
      },
      endPosition: {
        row: 51,
        column: 16,
      },
      value: "Lev",
    },
    parent: {
      startPosition: {
        row: 51,
        column: 24,
      },
      endPosition: {
        row: 51,
        column: 27,
      },
      value: ".",
    },
    instance: {
      value: {
        type: {
          startPosition: {
            row: 4,
            column: 19,
          },
          endPosition: {
            row: 4,
            column: 32,
          },
          value: "PackedScene",
        },
        uid: {
          startPosition: {
            row: 4,
            column: 37,
          },
          endPosition: {
            row: 4,
            column: 57,
          },
          value: "uid://jt3wvha7tsv3",
        },
        id: {
          startPosition: {
            row: 4,
            column: 116,
          },
          endPosition: {
            row: 4,
            column: 125,
          },
          value: "3_qw60k",
        },
        path: {
          startPosition: {
            row: 4,
            column: 63,
          },
          endPosition: {
            row: 4,
            column: 112,
          },
          value: "res://Scenes/Main/LevelButton/level_button.tscn",
        },
      },
      startPosition: {
        row: 51,
        column: 28,
      },
      endPosition: {
        row: 51,
        column: 59,
      },
    },
  },
  {
    name: {
      startPosition: {
        row: 56,
        column: 11,
      },
      endPosition: {
        row: 56,
        column: 18,
      },
      value: "Level",
    },
    type: {
      startPosition: {
        row: 56,
        column: 24,
      },
      endPosition: {
        row: 56,
        column: 31,
      },
      value: "Level",
    },
    parent: {
      startPosition: {
        row: 56,
        column: 39,
      },
      endPosition: {
        row: 56,
        column: 42,
      },
      value: ".",
    },
  },
];
