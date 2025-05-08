import path from "path";
import { FullPathDir, FullPathFile } from "../types";

export const getGodotProjectDir = (projectFile: FullPathFile): FullPathDir => {
  const gdp = path.dirname(projectFile);
  return gdp;
};
