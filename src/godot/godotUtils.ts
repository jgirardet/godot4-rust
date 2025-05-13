import path from "path";
import { FullPathDir, FullPathFile } from "../types";

export const getGodotProjectDir = (projectFile: FullPathFile): FullPathDir => {
  return path.dirname(projectFile);
};
