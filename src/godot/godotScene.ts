import { FullPathDir, FullPathFile } from "../types";
import { GodotPath } from "./godotPath";
import { TscnParser } from "./parser";
import { GDScene, ResPath, Uid } from "./types";

export class GodotScene {
  private _gdscene: GDScene;
  private _path: GodotPath;

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
    return this._gdscene.extResources.reduce((acc, e, _, __) => {
      if (e.type.value === "PackedScene") {
        acc.push(GodotPath.fromRes(e.path.value));
      }
      return acc;
    }, [] as GodotPath[]);
  }

  static async new(
    tscnFile: FullPathFile,
    godotDir: FullPathDir
  ): Promise<GodotScene> {
    let gdScene = (await TscnParser.new(tscnFile)).parse();
    return new GodotScene(GodotPath.fromAbs(tscnFile, godotDir), gdScene);
  }
}
