import { NodeItem } from "../../panel/nodeItem";
import { runTests } from "@vscode/test-electron";
import path from "path";
import { ExtensionContext } from "vscode";
import { setupTest } from "../common";

async function go() {
  let $ = setupTest({ dirRust: "panel/panel", dirGodot: "panel" });
  let devP = path.resolve(__filename, "../../../../");
  let testP = path.resolve(__filename, "../test/index.js");
  runTests({
    extensionDevelopmentPath: devP,
    extensionTestsPath: testP,
    launchArgs: [$.rustPath],
    version: "insiders",
  }).catch((e) => {
    console.log(e);
  });
}

go();
