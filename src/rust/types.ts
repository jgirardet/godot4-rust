import { BooleanAttribute, StringAttribute } from "../tree/types";
import { FullPathFile } from "../types";

export interface RustParsed {
  className: StringAttribute;
  init: boolean;
  baseClass?: StringAttribute;
}

export interface GodotModule extends RustParsed {
  path: FullPathFile;
}
