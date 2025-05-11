import { FullPathDir, FullPathFile } from "../types";
import { GodotPath } from "./godotPath";
import { TscnParser } from "./parser";
import { GDScene, Uid } from "./types";

export class GodotScene {
  _gdscene: GDScene;
  _path: GodotPath;

  constructor(tscnPath: GodotPath, gdScene: GDScene) {
    this._path = tscnPath;
    this._gdscene = gdScene;
  }

  get path(): GodotPath {
    return this._path;
  }

  get uid(): Uid {
    return this._gdscene.uid;
  }

  get depedencies(): GodotPath[] {
    let acc = [];
    for (const ressou of this._gdscene.extResources) {
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
