import { globSync } from "glob";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";

function rmDirGlob(dir: string[] | string) {
  for (let d of globSync(dir)) {
    rmSync(d, { recursive: true, force: true });
  }
}

function rmTmp() {
  rmDirGlob(`${tmpdir()}/grudot*`);
}

function main() {
  const { argv } = process;
  let command = argv[2];
  if (command === "rm") {
    rmDirGlob(argv.slice(3));
  } else if (command === "rmTmp") {
    rmDirGlob(`${tmpdir()}/grudot*`);
  } else if (command === "cleanUI") {
    rmDirGlob([".test-extensions", "godot4-rust*.vsix", "out"]);
    rmTmp();
  }
}

main();
