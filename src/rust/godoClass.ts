import { FullPathFile } from "../types";
import { Cache } from "../utils";
import { RustParser } from "./parser";
import {
  Attributable,
  Attribute,
  Field,
  HasArgParam,
  NodableType,
  Struct,
} from "./nodable";

export class GodotClass implements Attributable {
  private C = new Cache();

  constructor(readonly struct: Struct) {}

  static fromString(source: string) {
    let parser = RustParser.source(source);
    let struct = parser.getGodotClass();
    if (struct) {
      return new GodotClass(struct);
    }
  }

  get className(): string {
    return this.struct.name;
  }

  get baseClass(): string | undefined {
    return this.struct.attribute("class")?.argValue("base") as
      | string
      | undefined;
  }

  get hasDefaultInit(): boolean {
    return this.C.cache("hasDefaultInit", () => {
      return this.struct.attribute("class")?.argValue("init");
    });
  }

  attribute(ident: string): Attribute | undefined {
    return this.C.cache(`attr-${ident}`, () => this.struct.attribute(ident));
  }

  attributArg(attribute: string, arg: HasArgParam): NodableType | undefined {
    return this.attribute(attribute)?.argValue(arg);
  }

  field(name: string): Field | undefined {
    return this.struct.field(name);
  }

  fieldAttributeArgValue(
    field: string,
    attribute: string,
    arg: HasArgParam
  ): NodableType | undefined {
    return this.field(field)?.attribute(attribute)?.argValue(arg);
  }

  fieldAttribute(field: string, attribute: string): NodableType | undefined {
    return this.field(field)?.attribute(attribute);
  }
}

export class StoredGodotClass extends GodotClass {
  private constructor(readonly file: FullPathFile, struct: Struct) {
    super(struct);
  }

  static async fromFile(file: FullPathFile) {
    let parser = await RustParser.file(file);
    let struct = parser.getGodotClass();
    if (struct) {
      return new StoredGodotClass(file, struct);
    }
  }
}
