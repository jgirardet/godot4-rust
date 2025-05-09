import Benchmark from "benchmark";
import { GodotManager } from "../../godot/godotManager";
import path from "path";

var suite = new Benchmark.Suite();

const setup = (str: string) => {
  let gm = new GodotManager(path.resolve(__dirname, str));
  //   gm.load();
  //   console.log(gm);
  return gm;
};

const gm = setup("assets/depedencies/project.godot");
const scal = setup("../Rien/Scalazard/project.godot");
// add tests
let rs = suite

  .add("load dependencies", async function () {
    await gm.reload();
  })
  .add("load scal", async function () {
    await scal.reload();
  })
  .add(
    "change dependcies child 2",
    async function () {
      await gm.onChange(path.resolve("assets/depedencies/child2.tscn"));
    },
    {
      onStart: async () => {
        await gm.reload();
      },
    }
  )
  // add listeners
  .on("cycle", function (event: Benchmark.Event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log("Fastest is " + suite.filter("fastest").map("name"));
    suite.forEach((x: Benchmark) => formatBench(x));
  })
  // run async
  .run({ async: true });

const formatBench = (s: Benchmark) => {
  console.log(`${s.name}\t\t${s.times.period * 1000000} ms\t${s.times.period * 1000000} ms`);
};
