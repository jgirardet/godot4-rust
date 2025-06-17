import { FullPathDir, FullPathFile } from "../types";
import { GodotPath, IGodotPath } from "./godotPath";
import { parseResFile, parseResFileSync } from "./resParser";
import { GDScene } from "./types";

export class GodotScene implements IGodotScene {
  readonly gdscene: GDScene;
  readonly tscnpath: GodotPath;

  constructor(tscnPath: GodotPath, gdScene: GDScene) {
    this.tscnpath = tscnPath;
    this.gdscene = gdScene;
  }

  get depedencies(): GodotPath[] {
    let acc = [];
    for (const ressou of this.gdscene.extResources) {
      if (ressou.type === "PackedScene") {
        acc.push(GodotPath.fromRes(ressou.path));
      }
    }
    return acc;
  }

  static async new(
    tscnFile: FullPathFile,
    godotDir: FullPathDir
  ): Promise<GodotScene> {
    let gdScene = await parseResFile(tscnFile);
    return new GodotScene(GodotPath.fromAbs(tscnFile, godotDir), gdScene);
  }
  static newSync(tscnFile: FullPathFile, godotDir: FullPathDir): GodotScene {
    let gdScene = parseResFileSync(tscnFile);
    return new GodotScene(GodotPath.fromAbs(tscnFile, godotDir), gdScene);
  }
}

export interface IGodotScene {
  tscnpath: IGodotPath;
  gdscene: GDScene;
}
