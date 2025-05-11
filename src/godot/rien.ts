// // VGimport path from "path";
// import Piscina from "piscina";
// import { createBunchOfGodotScenes,  } from "./workerGodot";
// import { globSync } from "glob";

// const piscina = new Piscina({
//   filename: path.resolve(__dirname, "./workerWrapper.js"),
//   workerData: { fullpath: filename },
// });

// let files = globSync(
//   "/home/jim/Rien/godot4-rust/assets/GodotProject/**/*.tscn"
// );
// async function main() {
//   let res = await piscina.run(
//     {
//       bunch: files,
//       godotdir: "/home/jim/godot4-rust/assets/GodotProject",
//     },
//     { name: "createBunchOfGodotScenes" }
//   );
//   console.log(res);
// }

// main();
