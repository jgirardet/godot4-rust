import { glob } from "glob";
import { FullPathDir, FullPathFile } from "../types";
import path from "path";
import { GodotScene } from "./godotScene";
import { GodotPath, gp } from "./godotPath";
import { getGodotProjectDir } from "./godotUtils";

export class GodotManager {
  dependencies: Map<string, Set<string>> = new Map();
  private _godotProjectFile: FullPathFile;
  private _godotProjectDir: FullPathDir;
  scenes: Map<string, GodotScene> = new Map();

  cont: number = 0;

  constructor(godotProjectFile: FullPathFile) {
    this._godotProjectFile = godotProjectFile;
    this._godotProjectDir = getGodotProjectDir(godotProjectFile);
  }

  async reload() {
    this.scenes.clear();
    this.dependencies.clear();
    await this.load();
  }

  async load(): Promise<GodotScene[]> {
    return Promise.all(
      (
        await glob(path.join(this._godotProjectDir, "**/*.tscn"), {
          absolute: true,
        })
      ).map((l) => this.loadScene(l))
    );
  }

  async loadScene(scenePath: FullPathFile): Promise<GodotScene> {
    let scene = await GodotScene.new(scenePath, this._godotProjectDir);
    for (const d of scene.depedencies) {
      this._setDependency(d, scene.path);
    }
    this._addScene(scene);
    return scene;
  }

  unloadScene(scene: GodotPath) {
    this._deleteScene(scene);
    // this.dependencies.delete();
  }

  async onChange(
    filename: FullPathFile,
    remove: boolean = false
  ): Promise<GodotScene[]> {
    let filepath = GodotPath.fromAbs(filename, this._godotProjectDir);

    let scene = this._getScene(filepath);
    if (!scene) {
      return [await this.loadScene(filename)];
    }

    let toUpdate = this._findDependants(filepath.base);
    if (remove) {
      const toRemove = toUpdate.delete(filepath.base);
      this.unloadScene(filepath);
    }
    return await Promise.all(
      [...toUpdate].map((u) =>
        this.loadScene(gp(u).toAbs(this._godotProjectDir))
      )
    );
  }

  _findDependants(scenePath: string, acc?: Set<string>): Set<string> {
    let res = acc ?? new Set();
    res.add(scenePath);
    for (let r of this._getDependencies(scenePath)) {
      this._findDependants(r, res);
    }
    return res;
  }

  _setDependency(child: GodotPath, parent: GodotPath) {
    this.dependencies.get(child.base)?.add(parent.base) ||
      this.dependencies.set(child.base, new Set([parent.base]));
  }

  _getDependencies(key: string): Set<string> {
    return this.dependencies.get(key) || new Set();
  }

  _deleteDependencies(key: GodotPath) {
    this.dependencies.delete(key.base);
    for (const [k, v] of this.dependencies) {
      v.delete(key.base);
    }
  }

  _addScene(scene: GodotScene) {
    this.scenes.set(scene.path.base, scene);
  }

  _getScene(gp: GodotPath): GodotScene | undefined {
    return this.scenes.get(gp.base);
  }

  _deleteScene(scene: GodotPath) {
    this.scenes.delete(scene.base);
  }
}
