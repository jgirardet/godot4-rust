import { globSync } from "glob";
import { FullPathDir, FullPathFile } from "../types";
import { GodotScene } from "./godotScene";
import { GodotPath, gp } from "./godotPath";
import { getGodotProjectDir } from "./godotUtils";
import { availableParallelism } from "os";
import path from "path";
import Piscina from "piscina";
import { CreateSceneWorkerArgs, workerFilename } from "./workerGodot";

const createScenesWorker = new Piscina<CreateSceneWorkerArgs, GodotScene[]>({
  filename: path.resolve(__dirname, "./workerWrapper.js"),
  workerData: { fullpath: workerFilename },
});

export class GodotManager {
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

  async reset() {
    this.scenes.clear();
    this.dependencies.clear();
    await this.load();
  }

  async load(nbWorker?: number) {
    let files = globSync("**/*.tscn", {
      absolute: true,
      cwd: this.projectDir,
      nodir: true,
    });
    await this.addScenes(files, nbWorker);
  }

  async addScenes(files: string[], nbWorker?: number) {
    for (const bunch of await this._loadTscns(files, nbWorker)) {
      for (const ghostScene of bunch) {
        // js worker make loosing getter and other, need to redo the object
        const scene = new GodotScene(
          gp(ghostScene.path.base),
          ghostScene.gdscene
        );
        for (const dep of scene.depedencies) {
          this._setDependency(dep, scene.path);
        }
        this._addScene(scene);
      }
    }
  }

  async onChange(filename: FullPathFile, remove: boolean = false) {
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
    await this.addScenes(toUpdateFinale);
    this.lastUpdate = [...toUpdate];
  }

  getScene(gp: GodotPath): GodotScene | undefined {
    return this.scenes.get(gp.base);
  }

  _findDependants(scenePath: string, acc?: Set<string>): Set<string> {
    let res = acc ?? new Set();
    res.add(scenePath);
    for (let r of this._getDependencies(scenePath)) {
      this._findDependants(r, res);
    }
    return res;
  }

  async _loadTscns(
    files: string[],
    nbWorker?: number
  ): Promise<GodotScene[][]> {
    let chu = chunks(files, nbWorker || getWorkersNb(files.length));

    return await Promise.all(
      // []
      chu.map((i) => {
        return createScenesWorker.run(
          { bunch: i, godotdir: this.projectDir },
          { name: "createBunchOfGodotScenes" }
        );
        //   new Promise<GodotScene[]>((resolve, reject) => {
        //     const worker = new Worker(WorkerScript as string, {
        //       eval: true,
        //       workerData: { bunchFiles: i, gododir: this._godotProjectDir },
        //     })
        //       .on("message", (scenes: GodotScene[]) => {
        //         resolve(scenes);
        //       })

        //       .on("error", (e) => {
        //         reject(`Fail to parse scene ${e}`);
        //       });
        // })
      })
    );
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

  _setDependency(child: GodotPath, parent: GodotPath) {
    this.dependencies.get(child.base)?.add(parent.base) ||
      this.dependencies.set(child.base, new Set([parent.base]));
  }

  _addScene(scene: GodotScene) {
    this.scenes.set(scene.path.base, scene);
  }

  _deleteScene(scene: GodotPath) {
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
