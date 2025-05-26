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
      range: {
        startIndex: 79,
        endIndex: 90,
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
        startIndex: 95,
        endIndex: 116,
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
        startIndex: 149,
        endIndex: 158,
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
        startIndex: 122,
        endIndex: 145,
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
        startIndex: 179,
        endIndex: 194,
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
        startIndex: 199,
        endIndex: 220,
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
        startIndex: 266,
        endIndex: 275,
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
        startIndex: 226,
        endIndex: 262,
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
        startIndex: 296,
        endIndex: 309,
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
        startIndex: 314,
        endIndex: 334,
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
        startIndex: 393,
        endIndex: 402,
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
        startIndex: 340,
        endIndex: 389,
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
        startIndex: 480,
        endIndex: 486,
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
        startIndex: 492,
        endIndex: 503,
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
      startIndex: 469,
      endIndex: 505,
      startPosition: {
        row: 7,
        column: 0,
      },
      endPosition: {
        row: 7,
        column: 36,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 614,
        endIndex: 627,
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
        startIndex: 633,
        endIndex: 646,
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
        startIndex: 654,
        endIndex: 657,
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
      startIndex: 603,
      endIndex: 659,
      startPosition: {
        row: 14,
        column: 0,
      },
      endPosition: {
        row: 14,
        column: 56,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 834,
        endIndex: 838,
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
        startIndex: 844,
        endIndex: 861,
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
        startIndex: 869,
        endIndex: 872,
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
      startIndex: 823,
      endIndex: 874,
      startPosition: {
        row: 24,
        column: 0,
      },
      endPosition: {
        row: 24,
        column: 51,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1169,
        endIndex: 1173,
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
        startIndex: 1179,
        endIndex: 1194,
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
        startIndex: 1202,
        endIndex: 1206,
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
      startIndex: 1158,
      endIndex: 1208,
      startPosition: {
        row: 36,
        column: 0,
      },
      endPosition: {
        row: 36,
        column: 50,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1236,
        endIndex: 1243,
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
        startIndex: 1249,
        endIndex: 1256,
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
        startIndex: 1264,
        endIndex: 1271,
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
      startIndex: 1225,
      endIndex: 1273,
      startPosition: {
        row: 39,
        column: 0,
      },
      endPosition: {
        row: 39,
        column: 48,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1409,
        endIndex: 1415,
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
        startIndex: 1421,
        endIndex: 1436,
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
        startIndex: 1444,
        endIndex: 1451,
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
      startIndex: 1398,
      endIndex: 1453,
      startPosition: {
        row: 46,
        column: 0,
      },
      endPosition: {
        row: 46,
        column: 55,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1517,
        endIndex: 1522,
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
        startIndex: 1530,
        endIndex: 1533,
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
            startIndex: 296,
            endIndex: 309,
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
            startIndex: 314,
            endIndex: 334,
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
            startIndex: 393,
            endIndex: 402,
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
            startIndex: 340,
            endIndex: 389,
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
        startIndex: 1534,
        endIndex: 1565,
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
      startIndex: 1506,
      endIndex: 1566,
      startPosition: {
        row: 51,
        column: 0,
      },
      endPosition: {
        row: 51,
        column: 60,
      },
    },
  },
  {
    name: {
      range: {
        startIndex: 1636,
        endIndex: 1643,
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
        startIndex: 1649,
        endIndex: 1656,
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
        startIndex: 1664,
        endIndex: 1667,
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
      startIndex: 1625,
      endIndex: 1669,
      startPosition: {
        row: 56,
        column: 0,
      },
      endPosition: {
        row: 56,
        column: 44,
      },
    },
  },
];
