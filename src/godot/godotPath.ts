import path from "path";
import { FullPathDir, FullPathFile } from "../types";
import { ResPath } from "./types";

export class GodotPath {
  readonly base: string;

  constructor(base: string) {
    this.base = base;
  }

  static fromRes(res: ResPath): GodotPath {
    return new GodotPath(res.slice(6));
  }

  static fromAbs(filename: FullPathFile, godotDir: FullPathDir) {
    return new GodotPath(path.relative(godotDir, filename));
  }

  get toRes(): ResPath {
    return "res://" + this.base;
  }

  toAbs(godotDir: FullPathDir): FullPathFile {
    return path.join(godotDir, this.base);
  }

  eq(other: GodotPath): boolean {
    return this.base === other.base;
  }
}

export const gp = (file: string): GodotPath => new GodotPath(file);
