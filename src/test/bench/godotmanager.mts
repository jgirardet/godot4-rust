import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { expect } from "earl";

import GODOT from "tree-sitter-godot-resource";
// import { TreeSitterParser } from "../tree/treeSitterParser";
import Parser, { Query, QueryCapture } from "tree-sitter";
import { bench, run } from "mitata";
import { assert } from "console";
import { GodotManager } from "../../godot/godotManager.js";
import { execSync } from "child_process";
import { glob, globSync } from "glob";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { TscnParser, tscnParser } from "../../godot/parser.js";
import { GDScene } from "../../godot/types.js";

function node(scm: string, n: string) {
  const parser = new Parser();
  parser.setLanguage(GODOT as Parser.Language);
  const tree = parser.parse(
    readFileSync(`assets/GodotProject/Scenes/Main/${n}`, {
      encoding: "utf-8",
    })
  );
  let node = tree.rootNode;

  return node;
}
function query(scm: string, file: string) {
  const parser = new Parser();
  parser.setLanguage(GODOT as Parser.Language);
  const tree = parser.parse(
    readFileSync(`assets/GodotProject/Scenes/Main/${file}`, {
      encoding: "utf-8",
    })
  );
  let node = tree.rootNode;

  let scn = readFileSync(`src/queries/${scm}.scm`, {
    encoding: "utf-8",
  });
  let q = new Query(GODOT as Parser.Language, scn);
  return q;
}
function captures() {
  let tscn = query("tscn", "main.tscn");
  let title = query("uid", "main.tscn");
  let resource = query("resources", "main.tscn");
  let nodes = query("nodes", "main.tscn");
  let tscn2 = query("tscn", "main2.tscn");
  let title2 = query("uid", "main2.tscn");
  let resource2 = query("resources", "main2.tscn");
  let nodes2 = query("nodes", "main2.tscn");
  let n = node("tscn", "main.tscn");
  let m = node("tscn", "main2.tscn");
  let a: number, b: number, c: number, d: number, e: number;
  bench("tscn", () => {
    a = tscn.captures(n).length;
  });
  bench("title", () => {
    b = title.captures(n).length;
  });
  // bench("resources", () => {
  //   c = resource.captures(n).length;
  // });
  // bench("node", () => {
  //   d = nodes.captures(n).length;
  // });
  bench("tscn", () => {
    tscn.matches(n);
  });
  bench("tscn 2", () => {
    tscn2.matches(m);
  });
  bench("tscn cap", () => {
    tscn.captures(n);
  });
  bench("trois", () => {
    title.matches(n);
    resource.matches(n);
    nodes.matches(n);
  });
  bench("trois 2", () => {
    title2.matches(m);
    resource2.matches(m);
    nodes2.matches(m);
  });
  bench("trois cap", () => {
    title.captures(n);
    resource.captures(n);
    nodes.captures(n);
  });
  // bench("title", () => {
  //   title.matches(n);
  // });
  bench("title", () => {
    title.matches(n);
  });
  bench("resources", () => {
    resource.matches(n);
  });
  bench("resources 2", () => {
    resource.matches(m);
  });
  // bench("node", () => {
  //   d = nodes.matches(n).length;
  // });
  // async function mainModule() {
  //   await
}
function createTscndirs(nbFiles: number): string {
  let tmp = mkdtempSync(
    path.join(tmpdir(), "grudot_" + nbFiles.toString() + "-files")
  );
  let p = path.resolve("assets/GodotProject/Scenes/Main/main.tscn");
  [...Array(nbFiles).keys()].forEach((f: number) =>
    copyFileSync(p, path.join(tmp, f.toString() + path.basename(p)))
  );
  const res = path.join(tmp, "project.godot");
  writeFileSync(res, "");
  return res;
}

function benchNbWorkerBigDirs() {
  let dirs = [
    1, 2, 3, 4, 5, 6, 10, 20, 30, 50, 80, 100, 150, 200, 300, 1000,
  ].map(createTscndirs);

  bench("load $files files on $cpus cpus", function* load(state: any) {
    let files = state.get("files");
    let cpus = state.get("cpus");
    yield async () => {
      await new GodotManager(files)._loadTscns(cpus);
    };
  })
    .args("cpus", [4, 8, undefined])
    .args("files", dirs);
}

function benchNbWorkersScalAndGodotProject() {
  let p = path.resolve("assets/GodotProject/project.godot");
  let g = new GodotManager(p);
  let s = "/home/jim/Rien/Scalazard/project.godot";
  let fichiers = () =>
    globSync("**/*.tscn", {
      cwd: "/home/jim/Rien/Scalazard",
      absolute: true,
      nodir: true,
    });
  let scal = new GodotManager(s);
  bench("load $fn", function* load(state: any) {
    // scal.load().then((x) => {});
    let fn = state.get("fn");
    yield async () => {
      // scal.lastUpdate = [];
      // await scal.onChange("/home/jim/Rien/Scalazard/Entities/Bat/bat.tscn");
      // console.log(scal.lastUpdate);

      // await scal._loadTscns(fichiers(), fn);
      // await scal.load(fn);
    };
  }).args("fn", [1, 4, 8, 12, 16, 1]);
  // console.log(scal.scenes);
  // bench("on change", async () => {});
}

async function benchArrays() {
  let scene = (
    await TscnParser.file(
      path.resolve("assets/GodotProject/Scenes/Main/main.tscn")
    )
  ).parse();

  let arr = [
    [...Array(20).keys()].map((_) => scene),
    [...Array(20).keys()].map((_) => scene),
    [...Array(20).keys()].map((_) => scene),
    [...Array(20).keys()].map((_) => scene),
    [...Array(20).keys()].map((_) => scene),
  ];
  console.log(arr);
  bench("un", () => {
    let a = arr.flat();
  });
  bench("deux", () => {
    let a = [];
    arr.forEach((v) =>
      v.forEach((element) => {
        a.push(element);
      })
    );
  });

  bench("reduce", () => {
    let a = arr.reduce((acc, val, _, __) => {
      return acc.concat(val);
      // return acc;
    }, []);
  });
  bench("other", () => {
    let res = [];
    for (const a of arr) {
      for (const b of a) {
        res.push(b);
      }
    }
  });
  bench("forEach2", () => {
    let a: GDScene[] = [];
    arr.forEach((v) => (a = a.concat(v)));
  });
}

benchNbWorkersScalAndGodotProject();
// benchNbWorkerBigDirs();
// benchArrays();
run();
// run();
//   console.log(a);
//   console.log(b);
//   console.log(c);
//   console.log(d);
//   console.log(e);
// }
// mainModule();
