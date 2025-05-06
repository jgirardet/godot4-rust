import { readFileSync } from "fs";
import path from "path";
import { TscnParser } from "../../tscn/parser";
import { expect } from "earl";

interface GDScene {
  uid: string;
  ext_resources: ExtResource[];
  nodes: Node[];
}

interface ExtResource {
  type: string;
  uid: string;
  path: string;
  id: string;
}

interface Node {
  name: string;
  type: string;
  parent?: string;
  instance?: ExtResource;
}

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
      expect(res).toEqual([
        {
          type: "Texture2D",
          uid: "uid://dycv01s4vud8g",
          id: "1_lixft",
          path: "res://assets/Gray.png",
        },
        {
          type: "LabelSettings",
          uid: "uid://b0kponm3gbkqq",
          id: "2_qw60k",
          path: "res://Resources/MainTitleFont.tres",
        },
        {
          type: "PackedScene",
          uid: "uid://jt3wvha7tsv3",
          id: "3_qw60k",
          path: "res://Scenes/Main/LevelButton/level_button.tscn",
        },
      ]);
    });
  });
});
