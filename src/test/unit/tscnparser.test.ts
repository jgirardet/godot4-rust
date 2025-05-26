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
    let rs = p.getNodes();
    expect(rs).toEqual(nodes);
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
      range: {
        startIndex: 81,
        endIndex: 92,
        startPosition: {
          row: 2,
          column: 19,
        },
        endPosition: {
          row: 2,
          column: 30,
        },
      },
      value: "Texture2D",
    },
    uid: {
      range: {
        startIndex: 97,
        endIndex: 118,
        startPosition: {
          row: 2,
          column: 35,
        },
        endPosition: {
          row: 2,
          column: 56,
        },
      },
      value: "uid://dycv01s4vud8g",
    },
    id: {
      range: {
        startIndex: 151,
        endIndex: 160,
        startPosition: {
          row: 2,
          column: 89,
        },
        endPosition: {
          row: 2,
          column: 98,
        },
      },
      value: "1_lixft",
    },
    path: {
      range: {
        startIndex: 124,
        endIndex: 147,
        startPosition: {
          row: 2,
          column: 62,
        },
        endPosition: {
          row: 2,
          column: 85,
        },
      },
      value: "res://assets/Gray.png",
    },
  },
  {
    type: {
      range: {
        startIndex: 182,
        endIndex: 197,
        startPosition: {
          row: 3,
          column: 19,
        },
        endPosition: {
          row: 3,
          column: 34,
        },
      },
      value: "LabelSettings",
    },
    uid: {
      range: {
        startIndex: 202,
        endIndex: 223,
        startPosition: {
          row: 3,
          column: 39,
        },
        endPosition: {
          row: 3,
          column: 60,
        },
      },
      value: "uid://b0kponm3gbkqq",
    },
    id: {
      range: {
        startIndex: 269,
        endIndex: 278,
        startPosition: {
          row: 3,
          column: 106,
        },
        endPosition: {
          row: 3,
          column: 115,
        },
      },
      value: "2_qw60k",
    },
    path: {
      range: {
        startIndex: 229,
        endIndex: 265,
        startPosition: {
          row: 3,
          column: 66,
        },
        endPosition: {
          row: 3,
          column: 102,
        },
      },
      value: "res://Resources/MainTitleFont.tres",
    },
  },
  {
    type: {
      range: {
        startIndex: 300,
        endIndex: 313,
        startPosition: {
          row: 4,
          column: 19,
        },
        endPosition: {
          row: 4,
          column: 32,
        },
      },
      value: "PackedScene",
    },
    uid: {
      range: {
        startIndex: 318,
        endIndex: 338,
        startPosition: {
          row: 4,
          column: 37,
        },
        endPosition: {
          row: 4,
          column: 57,
        },
      },
      value: "uid://jt3wvha7tsv3",
    },
    id: {
      range: {
        startIndex: 397,
        endIndex: 406,
        startPosition: {
          row: 4,
          column: 116,
        },
        endPosition: {
          row: 4,
          column: 125,
        },
      },
      value: "3_qw60k",
    },
    path: {
      range: {
        startIndex: 344,
        endIndex: 393,
        startPosition: {
          row: 4,
          column: 63,
        },
        endPosition: {
          row: 4,
          column: 112,
        },
      },
      value: "res://Scenes/Main/LevelButton/level_button.tscn",
    },
  },
];
const nodes = [
  {
    name: {
      range: {
        startIndex: 487,
        endIndex: 493,
        startPosition: {
          row: 7,
          column: 11,
        },
        endPosition: {
          row: 7,
          column: 17,
        },
      },
      value: "Main",
    },
    type: {
      range: {
        startIndex: 499,
        endIndex: 510,
        startPosition: {
          row: 7,
          column: 23,
        },
        endPosition: {
          row: 7,
          column: 34,
        },
      },
      value: "MainScene",
    },
    range: {
      startIndex: 476,
      endIndex: 613,
      startPosition: {
        row: 7,
        column: 0,
      },
      endPosition: {
        row: 12,
        column: 17,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 628,
        endIndex: 641,
        startPosition: {
          row: 14,
          column: 11,
        },
        endPosition: {
          row: 14,
          column: 24,
        },
      },
      value: "TextureRect",
    },
    type: {
      range: {
        startIndex: 647,
        endIndex: 660,
        startPosition: {
          row: 14,
          column: 30,
        },
        endPosition: {
          row: 14,
          column: 43,
        },
      },
      value: "TextureRect",
    },
    parent: {
      range: {
        startIndex: 668,
        endIndex: 671,
        startPosition: {
          row: 14,
          column: 51,
        },
        endPosition: {
          row: 14,
          column: 54,
        },
      },
      value: ".",
    },
    range: {
      startIndex: 617,
      endIndex: 843,
      startPosition: {
        row: 14,
        column: 0,
      },
      endPosition: {
        row: 22,
        column: 16,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 858,
        endIndex: 862,
        startPosition: {
          row: 24,
          column: 11,
        },
        endPosition: {
          row: 24,
          column: 15,
        },
      },
      value: "MC",
    },
    type: {
      range: {
        startIndex: 868,
        endIndex: 885,
        startPosition: {
          row: 24,
          column: 21,
        },
        endPosition: {
          row: 24,
          column: 38,
        },
      },
      value: "MarginContainer",
    },
    parent: {
      range: {
        startIndex: 893,
        endIndex: 896,
        startPosition: {
          row: 24,
          column: 46,
        },
        endPosition: {
          row: 24,
          column: 49,
        },
      },
      value: ".",
    },
    range: {
      startIndex: 847,
      endIndex: 1190,
      startPosition: {
        row: 24,
        column: 0,
      },
      endPosition: {
        row: 34,
        column: 43,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1205,
        endIndex: 1209,
        startPosition: {
          row: 36,
          column: 11,
        },
        endPosition: {
          row: 36,
          column: 15,
        },
      },
      value: "VB",
    },
    type: {
      range: {
        startIndex: 1215,
        endIndex: 1230,
        startPosition: {
          row: 36,
          column: 21,
        },
        endPosition: {
          row: 36,
          column: 36,
        },
      },
      value: "VBoxContainer",
    },
    parent: {
      range: {
        startIndex: 1238,
        endIndex: 1242,
        startPosition: {
          row: 36,
          column: 44,
        },
        endPosition: {
          row: 36,
          column: 48,
        },
      },
      value: "MC",
    },
    range: {
      startIndex: 1194,
      endIndex: 1260,
      startPosition: {
        row: 36,
        column: 0,
      },
      endPosition: {
        row: 37,
        column: 15,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1275,
        endIndex: 1282,
        startPosition: {
          row: 39,
          column: 11,
        },
        endPosition: {
          row: 39,
          column: 18,
        },
      },
      value: "Label",
    },
    type: {
      range: {
        startIndex: 1288,
        endIndex: 1295,
        startPosition: {
          row: 39,
          column: 24,
        },
        endPosition: {
          row: 39,
          column: 31,
        },
      },
      value: "Label",
    },
    parent: {
      range: {
        startIndex: 1303,
        endIndex: 1310,
        startPosition: {
          row: 39,
          column: 39,
        },
        endPosition: {
          row: 39,
          column: 46,
        },
      },
      value: "MC/VB",
    },
    range: {
      startIndex: 1264,
      endIndex: 1440,
      startPosition: {
        row: 39,
        column: 0,
      },
      endPosition: {
        row: 44,
        column: 22,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1455,
        endIndex: 1461,
        startPosition: {
          row: 46,
          column: 11,
        },
        endPosition: {
          row: 46,
          column: 17,
        },
      },
      value: "Grid",
    },
    type: {
      range: {
        startIndex: 1467,
        endIndex: 1482,
        startPosition: {
          row: 46,
          column: 23,
        },
        endPosition: {
          row: 46,
          column: 38,
        },
      },
      value: "GridContainer",
    },
    parent: {
      range: {
        startIndex: 1490,
        endIndex: 1497,
        startPosition: {
          row: 46,
          column: 46,
        },
        endPosition: {
          row: 46,
          column: 53,
        },
      },
      value: "MC/VB",
    },
    range: {
      startIndex: 1444,
      endIndex: 1553,
      startPosition: {
        row: 46,
        column: 0,
      },
      endPosition: {
        row: 49,
        column: 11,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1568,
        endIndex: 1573,
        startPosition: {
          row: 51,
          column: 11,
        },
        endPosition: {
          row: 51,
          column: 16,
        },
      },
      value: "Lev",
    },
    parent: {
      range: {
        startIndex: 1581,
        endIndex: 1584,
        startPosition: {
          row: 51,
          column: 24,
        },
        endPosition: {
          row: 51,
          column: 27,
        },
      },
      value: ".",
    },
    instance: {
      value: {
        type: {
          range: {
            startIndex: 300,
            endIndex: 313,
            startPosition: {
              row: 4,
              column: 19,
            },
            endPosition: {
              row: 4,
              column: 32,
            },
          },
          value: "PackedScene",
        },
        uid: {
          range: {
            startIndex: 318,
            endIndex: 338,
            startPosition: {
              row: 4,
              column: 37,
            },
            endPosition: {
              row: 4,
              column: 57,
            },
          },
          value: "uid://jt3wvha7tsv3",
        },
        id: {
          range: {
            startIndex: 397,
            endIndex: 406,
            startPosition: {
              row: 4,
              column: 116,
            },
            endPosition: {
              row: 4,
              column: 125,
            },
          },
          value: "3_qw60k",
        },
        path: {
          range: {
            startIndex: 344,
            endIndex: 393,
            startPosition: {
              row: 4,
              column: 63,
            },
            endPosition: {
              row: 4,
              column: 112,
            },
          },
          value: "res://Scenes/Main/LevelButton/level_button.tscn",
        },
      },
      range: {
        startIndex: 1585,
        endIndex: 1616,
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
    range: {
      startIndex: 1557,
      endIndex: 1677,
      startPosition: {
        row: 51,
        column: 0,
      },
      endPosition: {
        row: 54,
        column: 20,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1692,
        endIndex: 1699,
        startPosition: {
          row: 56,
          column: 11,
        },
        endPosition: {
          row: 56,
          column: 18,
        },
      },
      value: "Level",
    },
    type: {
      range: {
        startIndex: 1705,
        endIndex: 1712,
        startPosition: {
          row: 56,
          column: 24,
        },
        endPosition: {
          row: 56,
          column: 31,
        },
      },
      value: "Level",
    },
    parent: {
      range: {
        startIndex: 1720,
        endIndex: 1723,
        startPosition: {
          row: 56,
          column: 39,
        },
        endPosition: {
          row: 56,
          column: 42,
        },
      },
      value: ".",
    },
    range: {
      startIndex: 1681,
      endIndex: 1724,
      startPosition: {
        row: 56,
        column: 0,
      },
      endPosition: {
        row: 56,
        column: 43,
      },
    },
  },
];
