import { glob } from "glob";
import { FullPathDir, FullPathFile } from "../types";
import { GodotScene } from "./godotScene";
import { GodotPath } from "./godotPath";
import { getGodotProjectDir } from "./godotUtils";
import { Worker } from "worker_threads";
import { availableParallelism } from "os";

export class GodotManager {
  dependencies: Map<string, Set<string>> = new Map();
  _godotProjectFile: FullPathFile;
  _godotProjectDir: FullPathDir;
  scenes: Map<string, GodotScene> = new Map();

  constructor(godotProjectFile: FullPathFile) {
    this._godotProjectFile = godotProjectFile;
    this._godotProjectDir = getGodotProjectDir(godotProjectFile);
  }

  reset() {
    this.scenes.clear();
    this.dependencies.clear();
  }

  async load(nbWorker?: number) {
    for (const bunch of await this._loadTscns(nbWorker)) {
      for (const ghostScene of bunch) {
        // js worken make loosing getter and other, need to redo the object
        const scene = new GodotScene(
          new GodotPath(ghostScene._path._base),
          ghostScene._gdscene
        );
        for (const dep of scene.depedencies) {
          this._setDependency(dep, scene.path);
        }
        this._addScene(scene);
      }
    }
  }

  async _loadTscns(nbWorker?: number): Promise<GodotScene[][]> {
    let files = await glob("**/*.tscn", {
      absolute: true,
      cwd: this._godotProjectDir,
      nodir: true,
    });
    let chu = chunks(files, nbWorker || getWorkersNb(files.length));
    return Promise.all(
      chu.map(
        (i) =>
          new Promise<GodotScene[]>((resolve, reject) => {
            const worker = new Worker("./src/godot/worker.js", {
              workerData: { bunch: i, gododir: this._godotProjectDir },
            })
              .on("message", (scenes: GodotScene[]) => {
                resolve(scenes);
              })

              .on("error", (e) => {
                reject(`Fail to parse scene ${e}`);
              });
          })
      )
    );
  }

  getScene(gp: GodotPath): GodotScene | undefined {
    return this.scenes.get(gp.base);
  }

  _setDependency(child: GodotPath, parent: GodotPath) {
    this.dependencies.get(child.base)?.add(parent.base) ||
      this.dependencies.set(child.base, new Set([parent.base]));
  }

  _addScene(scene: GodotScene) {
    this.scenes.set(scene.path.base, scene);
  }
}
function chunks<T>(arr: T[], n: number): T[][] {
  const list = arr;
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
