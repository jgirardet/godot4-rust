import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { FullPathDir, FullPathFile } from "./types";

export const readUtf8Sync = (path: string): string => {
  return readFileSync(path, { encoding: "utf-8" });
};

export const readUtf8 = (path: string): Promise<string> => {
  return readFile(path, { encoding: "utf-8" });
};

export const getGodotProjectDir = (projectFile: FullPathFile): FullPathDir => {
  return path.dirname(projectFile);
};

export class Cache {
  private _store = new Map<string, any>();

  get(key: string): any {
    return this._store.get(key);
  }

  store<T>(key: string, fn: () => T): T {
    let value: T = fn();
    this._store.set(key, value);
    return value;
  }

  cache<T>(key: string, fn: Function): T {
    return (
      this.get(key) ||
      (function (c: Cache) {
        let value: T = fn();
        c._store.set(key, value);
        return value;
      })(this)
    );
  }
}
