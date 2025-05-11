import { resolve } from "path";
import { GodotScene } from "./godotScene";
import { readFileSync } from "fs";
import { tscnParser, TscnParser } from "./parser";
import { GodotPath } from "./godotPath";

export const workerFilename = resolve(__filename);

export interface CreateSceneWorkerArgs {
  bunch: string[];
  godotdir: string;
}
export function createBunchOfGodotScenes({
  bunch,
  godotdir,
}: CreateSceneWorkerArgs): GodotScene[] {
  let res = bunch.map((d) => {
    const f = readFileSync(d, { encoding: "utf-8" });
    const parser = tscnParser(f);
    return new GodotScene(GodotPath.fromAbs(d, godotdir), parser.parse());
  });
  return res;
}
