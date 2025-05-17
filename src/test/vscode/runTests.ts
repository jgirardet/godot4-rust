import { assert } from "console";
import { GodotPath } from "../../godot/godotPath";
import { GodotScene } from "../../godot/godotScene";
import { NodeItem } from "../../panel/nodeItem";
import { classImports } from "../../snippets";
import { expect } from "earl";
import { runTests } from "@vscode/test-electron";
import path from "path";

// const main = async () => {
let devP = path.resolve(__filename, "../../../../");
let testP = path.resolve(__filename, "../test/index.js");
runTests({
  extensionDevelopmentPath: devP,
  extensionTestsPath: testP,
  launchArgs: [path.resolve("../../../../assets/ConfigProject")],
  version: "insiders",
}).catch((e) => {
  console.log(e);
});
  console.log(devP);
  console.log(testP);