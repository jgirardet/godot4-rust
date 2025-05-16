import { globSync } from "glob";
import { FullPathDir, FullPathFile } from "../types";
import { GodotScene, IGodotScene } from "./godotScene";
import { GodotPath, gp } from "./godotPath";
import { availableParallelism } from "os";
import path from "path";
import Piscina from "piscina";
import { CreateSceneWorkerArgs, workerFilename } from "./workerGodot";
import { getGodotProjectDir } from "../utils";

const createScenesWorker = new Piscina<CreateSceneWorkerArgs, GodotScene[]>({
  filename: path.resolve(__dirname, "./workerWrapper.js"),
  workerData: { fullpath: workerFilename },
});

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

  async load(nbWorker?: number): Promise<Map<string, GodotScene>> {
    let files = globSync("**/*.tscn", {
      absolute: true,
      cwd: this.projectDir,
      nodir: true,
    });
    return await this.addScenes(files, nbWorker);
  }

  async onChange(
    filename: FullPathFile,
    remove: boolean = false
  ): Promise<Map<string, GodotScene>> {
    let filepath = GodotPath.fromAbs(filename, this._godotProjectDir);

    let scene = this.getScene(filepath);

    // Create Scene
    if (!scene) {
      await this.addScenes([filename], 1);
      this.lastUpdate = [filepath.base];
    }

    let toUpdate = this._findDependants(filepath.base);

    // Delete Scene
    if (remove) {
      const toRemove = toUpdate.delete(filepath.base);
      this._deleteScene(filepath);
    }

    let toUpdateFinale = [...toUpdate].map((m) =>
      path.join(this._godotProjectDir, m)
    );

    // Reload only Scenes impacted by change (delete or change)
    this.lastUpdate = [...toUpdate];
    return await this.addScenes(toUpdateFinale);
  }

  getScene(gp: GodotPath): GodotScene | undefined {
    return this.scenes.get(gp.base);
  }

  private async addScenes(
    files: string[],
    nbWorker?: number
  ): Promise<Map<string, GodotScene>> {
    for (const bunch of await this._loadTscns(files, nbWorker)) {
      for (const ghostScene of bunch) {
        const scene = new GodotScene(
          gp(ghostScene.tscnpath.base),
          ghostScene.gdscene
        );
        this._addScene(scene);
      }
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

  private async _loadTscns(
    files: string[],
    nbWorker?: number
  ): Promise<IGodotScene[][]> {
    // js worker make loosing getter and other, need to redo the object
    let chu = chunks(files, nbWorker || getWorkersNb(files.length));
    return await Promise.all(
      chu.map((i) => {
        return createScenesWorker.run(
          { bunch: i, godotdir: this.projectDir },
          { name: "createBunchOfGodotScenes" }
        );
      })
    );
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
function chunks<T>(arr: T[], n: number): T[][] {
  const chunkSize = Math.ceil(arr.length / n);
  return [...Array(n).keys()].map((_) => arr.splice(0, chunkSize));
}

function getWorkersNb(length: number): number {
  const cpus = availableParallelism() / 2;
  if (length < cpus * cpus) {
    return cpus / 2;
  } else {
    return cpus;
  }
}
