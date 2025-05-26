import { expect } from "earl";
import { RustParser } from "../../rust/parser";
import { GodotClass } from "../../rust/godoClass";

describe("rust parser", function () {
  describe("ParsedGodotModule", function () {
    it("parse classname, base and init, AND NOTHING else", function () {
      let rp = new RustParser(`
use::bla::bla;
struct NotGodo;

// #[derive(NotGodotClass)]
// struct NotSoGodo

#[derive(GodotClass)]
// // somme comment
// #[someAttribute]
#[class(base=CharacterBody2D,init)]
// another comment
#[someOtherAttribute]
struct GodotStruct;
`);

      let res = new GodotClass(rp.getGodotClass()!);
      expect(res.className).toEqual("GodotStruct");
      expect(res.baseClass).toEqual("CharacterBody2D");
      expect(res.hasDefaultInit).toBeTruthy();
    });

    it("parse is no 'baseclass'", function () {
      let rp = new RustParser(`
    #[derive(GodotClass)]
    struct GodotStruct;
    `);

      let res = new GodotClass(rp.getGodotClass()!);
      expect(res.className).toEqual("GodotStruct");
      expect(res.baseClass).toEqual(undefined);
      expect(res.hasDefaultInit).toBeFalsy();
    });

    it("get only the first one", function () {
      let rp = new RustParser(`
    #[derive(GodotClass)]
    struct GodotStruct;

    #[derive(GodotClass)]
    struct GodotStruct2;
    `);
      let res = new GodotClass(rp.getGodotClass()!);
      expect(res.className).toEqual("GodotStruct");
      expect(res.baseClass).toEqual(undefined);
      expect(res.hasDefaultInit).toBeFalsy();
    });

    it("check all derive GodotClass args variant", () => {
      let gc = GodotClass.fromString(`
#[derive(GodotClass)]
#[class(init, base="Node2D", rename="Renamed", internal)]
struct Bla {}`)!;
      expect(gc.attributArg("class", "init")).toBeTruthy();
      expect(gc.attributArg("class", "base")).toEqual("Node2D");
      expect(gc.attributArg("class", "rename")).toEqual("Renamed");
      expect(gc.attributArg("class", "internal")).toBeTruthy();
    });

    it("check allfields args variant as alone", () => {
      let gc = GodotClass.fromString(`
    #[derive(GodotClass)]
    struct Bla {
      #[numeric(42)]
      #[string("bla")]
      #[raw(r#"raw"#)]
      #[float(3.24)]
      #[char('a')]
      #[ident(ident)]
      field: Sometype,

    }`)!;
      for (const [arg, res] of [
        ["numeric", 42],
        ["string", "bla"],
        ["raw", 'r#"raw"#'],
        ["float", 3.24],
        ["char", "a"],
        ["ident", "ident"],
      ]) {
        expect(
          gc.fieldAttributeArgValue("field", arg as string, res)
        ).toBeTruthy();
      }
    });

    it("check allfields args variant as assignment", () => {
      let gc = GodotClass.fromString(`
    #[derive(GodotClass)]
    struct Bla {
      #[init(val = 42)]
      a_numeric: i64,

      #[init(val = "bla")]
      a_str: &'static str,

      #[init(val = r#"raw"#)]
      a_raw: &'static str,

      #[init(val = 3.24)]
      a_float: f32,

      #[init(val = 'a')]
      a_char: char,
      
      #[init(val = ident)]
      a_ident: Sometype,

    }`)!;
      for (const [field, res] of [
        ["a_numeric", 42],
        ["a_str", "bla"],
        ["a_raw", 'r#"raw"#'],
        ["a_float", 3.24],
        ["a_char", "a"],
        ["a_ident", "ident"],
      ]) {
        expect(
          gc.fieldAttributeArgValue(field as string, "init", "val")
        ).toEqual(res);
      }
    });

    it("test specific rust godot export", () => {
      let gc = GodotClass.fromString(`
    #[derive(GodotClass)]
    struct MyStruct {
        // @export
        #[export]
        float: f64,

        // @export_range(0.0, 10.0, or_greater)
        #[export(range = (0.0, 10.0, or_greater))]
        range_f64: f64,

        // @export_flags_3d_physics
        #[export(flags_3d_physics)]
        physics: u32,

        // @export_file
        #[export(file)]
        file: GString,

        // // @export_file("*.gd")
        #[export(file = "*.gd")]
         gdscript_file: GString,

        // // @export_exp_easing
        #[export(exp_easing)]
        ease: f64,

        // @export_enum("One", "Two", "Ten:10", "Twelve:12", "Thirteen")
        #[export(enum = (One, Two, Ten = 10, Twelve = 12, Thirteen))]
        exported_enum: i64,

        // // @export_flags("A:1", "B:2", "AB:3")
        #[export(flags = (A = 1, B = 2, AB = 3))]
        flags: u32,
    }`)!;
      expect(gc.fieldAttribute("float", "export")).toBeTruthy();
      expect(gc.fieldAttribute("range_f64", "export")).toBeTruthy();
      expect(
        gc.fieldAttributeArgValue("physics", "export", "flags_3d_physics")
      ).toBeTruthy();
      expect(gc.fieldAttributeArgValue("file", "export", "file")).toBeTruthy();
      expect(
        gc.fieldAttributeArgValue("gdscript_file", "export", "file")
      ).toEqual("*.gd");
      expect(
        gc.fieldAttributeArgValue("ease", "export", "exp_easing")
      ).toBeTruthy();
      expect(
        gc.fieldAttributeArgValue("exported_enum", "export", "enum")
      ).toEqual("(One, Two, Ten = 10, Twelve = 12, Thirteen)"); // enum only as string yet
      expect(gc.fieldAttributeArgValue("flags", "export", "flags")).toEqual(
        "(A = 1, B = 2, AB = 3)"
      ); // enum only as string yet
    });
  });
  describe("isGodotModule", () => {
    it("find amm use::godot possible", () => {
      for (let [fe, res] of Object.entries({
        "use godot::prelude::*;": true,
        "i use godot::prelude::*;": false,
        "rien du tout": false,
        "use godot;": true,
        '"use godot"': false,
        godot: false,
        "use godot::bla{abla, bla};": true,
        "use godot::bla::abla{bla,blie};": true,
        "use godot as bla;": true,
        "use godot::bla as bla;": true,
      })) {
        expect(new RustParser(fe).isGodotModule).toEqual(res);
      }
    });
  });
});
