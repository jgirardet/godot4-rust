import { readFileSync } from "fs";
import path from "path";

export const NAME = "godot4-rust";
export const DISPLAY_NAME = "Godot4 Rust";
export const GODOT_PROJECT_FILEPATH_KEY = "godotProjectFilePath";
export const AUTO_REPLACE_TSCN_KEY = "autoReplaceInTscn";

export interface GodotSettings {
  "godot4-rust.godotProjectFilePath": string;
}

export const LAST_GODOT_CRATE_VERSION_AS_TOML: string = 'godot = "0.2.4"';

export const GODOTPROJET_IS_SET_KEY = NAME + ".project_set";

const loadFileQueries = (file: string) =>
  readFileSync(path.join(__filename, "../../resources", "queries", file), {
    encoding: "utf-8",
  });
export const ExtResourcesQuery = loadFileQueries("resources.scm");
export const NodesQuery = loadFileQueries("nodes.scm");
export const UidQuery = loadFileQueries("uid.scm");
export const godotModuleQuery = loadFileQueries("godotModule.scm");
