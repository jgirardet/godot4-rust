import { globSync } from "glob";
import { FullPathDir, FullPathFile } from "../types";
import { GodotScene } from "./godotScene";
import { GodotPath } from "./godotPath";
import path from "path";
import { getGodotProjectDir } from "../utils";

export class GodotProjectLoader {
  private _godotProjectFile: FullPathFile;
  private _godotProjectDir: FullPathDir;
  dependencies: Map<string, Set<string>> = new Map();
  scenes: Map<string, GodotScene> = new Map();
  lastUpdate: string[] = [];

  constructor(godotProjectFile: FullPathFile) {
    this._godotProjectFile = godotProjectFile;
    this._godotProjectDir = getGodotProjectDir(godotProjectFile);
  }

  get projectDir(): FullPathDir {
    return this._godotProjectDir;
  }

  get projectFile(): FullPathFile {
    return this._godotProjectFile;
  }

  async reload(): Promise<Map<string, GodotScene>> {
    this.scenes.clear();
    this.dependencies.clear();
    return this.load();
  }

  async load(): Promise<Map<string, GodotScene>> {
    let files = globSync("**/*.tscn", {
      absolute: true,
      cwd: this.projectDir,
      nodir: true,
    });
    return this.addScenes(files);
  }

  async onChange(
    filename: FullPathFile,
    remove: boolean = false
  ): Promise<Map<string, GodotScene>> {
    let filepath = GodotPath.fromAbs(filename, this._godotProjectDir);

    let scene = this.getScene(filepath);

    // Create Scene
    if (!scene) {
      await this.addScenes([filename]);
      this.lastUpdate = [filepath.base];
    }

    let toUpdate = this._findDependants(filepath.base);

    // Delete Scene
    if (remove) {
      toUpdate.delete(filepath.base);
      this._deleteScene(filepath);
    }

    let toUpdateFinale = [...toUpdate].map((m) =>
      path.join(this._godotProjectDir, m)
    );

    // Reload only Scenes impacted by change (delete or change)
    this.lastUpdate = [...toUpdate];
    return this.addScenes(toUpdateFinale);
  }

  getScene(gp: GodotPath): GodotScene | undefined {
    return this.scenes.get(gp.base);
  }

  private async addScenes(files: string[]): Promise<Map<string, GodotScene>> {
    for (const scene of await Promise.all(
      files.map((f) => GodotScene.new(f, this.projectDir))
    )) {
      this._addScene(scene);
    }

    this._resetDepencies();
    return this.scenes;
  }

  private _findDependants(scenePath: string, acc?: Set<string>): Set<string> {
    let res = acc ?? new Set();
    res.add(scenePath);
    for (let r of this._getDependencies(scenePath)) {
      this._findDependants(r, res);
    }
    return res;
  }

  private _getDependencies(key: string): Set<string> {
    return this.dependencies.get(key) || new Set();
  }

  private _resetDepencies() {
    for (const scene of this.scenes.values()) {
      for (const dep of scene.depedencies) {
        this._setDependency(dep, scene.tscnpath);
      }
    }
  }

  private _setDependency(child: GodotPath, parent: GodotPath) {
    this.dependencies.get(child.base)?.add(parent.base) ||
      this.dependencies.set(child.base, new Set([parent.base]));
  }

  private _addScene(scene: GodotScene) {
    this.scenes.set(scene.tscnpath.base, scene);
  }

  private _deleteScene(scene: GodotPath) {
    this.scenes.delete(scene.base);
  }
}
