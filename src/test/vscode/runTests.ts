import { NodeItem } from "../../panel/nodeItem";
import { runTests } from "@vscode/test-electron";
import path from "path";
import { ExtensionContext } from "vscode";

// const main = async () => {
async function go() {
  let devP = path.resolve(__filename, "../../../../");
  let testP = path.resolve(__filename, "../test/index.js");
  runTests({
    extensionDevelopmentPath: devP,
    extensionTestsPath: testP,
    // launchArgs: [path.resolve("../../../../assets/ConfigProject")],
    version: "insiders",
  }).catch((e) => {
    console.log(e);
  });
  console.log(devP);
  console.log(testP);
}

// export function activate(_context: ExtensionContext) {
//     // Set context as a global as some tests depend on it
//     (global as any).testExtensionContext = _context;
// }

go();
