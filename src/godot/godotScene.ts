import { FullPathDir, FullPathFile, Name } from "../types";
import { GodotPath, IGodotPath } from "./godotPath";
import { TscnParser } from "./parser";
import { GDScene, Node, Uid } from "./types";

export class GodotScene implements IGodotScene {
  readonly gdscene: GDScene;
  readonly tscnpath: GodotPath;

  constructor(tscnPath: GodotPath, gdScene: GDScene) {
    this.tscnpath = tscnPath;
    this.gdscene = gdScene;
  }

  get uid(): Uid {
    return this.gdscene.uid;
  }

  get rootNode(): Node {
    return this.gdscene.nodes.at(0)!; // there always id a root node
  }

  get depedencies(): GodotPath[] {
    let acc = [];
    for (const ressou of this.gdscene.extResources) {
      if (ressou.type.value === "PackedScene") {
        acc.push(GodotPath.fromRes(ressou.path.value));
      }
    }
    return acc;
  }

  static async new(
    tscnFile: FullPathFile,
    godotDir: FullPathDir
  ): Promise<GodotScene> {
    console.log("SCNENFCZ");
    let gdScene = (await TscnParser.file(tscnFile)).parse();
    return new GodotScene(GodotPath.fromAbs(tscnFile, godotDir), gdScene);
  }
}

export interface IGodotScene {
  tscnpath: IGodotPath;
  gdscene: GDScene;
}
