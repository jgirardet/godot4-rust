import { FullPathFile } from "../types";

export interface RustParsed {
  className: string;
  init: boolean;
  baseClass?: string;
}

export interface GodotModule {
  className: string;
  init: boolean;
  baseClass?: string;
  path: FullPathFile;
}
