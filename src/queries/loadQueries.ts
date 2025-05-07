import { readFileSync } from "fs";
import path from "path";

const loadFileQueries = (file: string) =>
  readFileSync(path.resolve("/home/jim/Rien/godot4-rust/src/queries", file), {
    //   readFileSync(path.resolve(__dirname, "..", "..", "src","queries", file), {
    encoding: "utf-8",
  });
export const ExtResourcesQuery = loadFileQueries("resources.scm");
export const NodesQuery = loadFileQueries("nodes.scm");
export const TitleQuery = loadFileQueries("title.scm");
export const godotModuleQuery = loadFileQueries("godotModule.scm");
