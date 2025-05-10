const { readFileSync } = require("node:fs");
const { workerData, parentPort } = require("node:worker_threads");
const TscnParser = require("../../out/godot/parser.js");
const GodotScene = require("../../out/godot/godotScene.js");
const GodotPath = require("../../out/godot/godotPath.js");

let res = workerData.bunch.map((d) => {
  const f = readFileSync(d, { encoding: "utf-8" });
  const parser = TscnParser.tscnParser(f);
  return new GodotScene.GodotScene(
    GodotPath.GodotPath.fromAbs(d, workerData.gododir),
    parser.parse()
  );
});
parentPort.postMessage(res);
