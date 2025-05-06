import { RustParser } from "../../rust/parser";
import { expect } from "earl";

describe("rust parser", function () {
  describe("ParsedGodotModule", function () {
    it("parse classname, base and init, AND NOTHING else", function () {
      let rp = new RustParser(`
use::bla::bla;
struct NotGodo;

#[derive(NotGodotClass)]
struct NotSoGodo

#[derive(GodotClass)]
// somme comment
#[someAttribute]
#[class(base=CharacterBody2D,init)]
// another comment
#[someOtherAttribute]
struct GodotStruct;
`);

      let res = rp.findGodotClass();
      expect(res).toEqual({
        className: "GodotStruct",
        init: "init",
        baseClass: "CharacterBody2D",
      });
    });
    it("parse is no 'class'", function () {
      let rp = new RustParser(`
#[derive(GodotClass)]
struct GodotStruct;
`);

      let res = rp.findGodotClass();
      expect(res).toEqual({
        className: "GodotStruct",
      });
    });
    it("get only the first one", function () {
      let rp = new RustParser(`
#[derive(GodotClass)]
struct GodotStruct;

#[derive(GodotClass)]
struct GodotStruct2;
`);

      let res = rp.findGodotClass();
      expect(res).toEqual({
        className: "GodotStruct",
      });
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
        "godot": false,
        "use godot::bla{abla, bla};": true,
        "use godot::bla::abla{bla,blie};": true,
        "use godot as bla;": true,
        "use godot::bla as bla;": true
      })) {
        expect(new RustParser(fe).isGodotModule).toEqual(res);
      }
    });
  });
});
