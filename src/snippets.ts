import { toSnake } from "ts-case-convert";
import { Node } from "./tscn/types";

export {
  onready_snippet,
  node_methods,
  implVirtualMethodsStart,
  implVirtualMethodsEnd,
  declGodotClassEnd,
  declGodotClassStart,
  classImports,
};

const onready_snippet = (node: Node): string[] => {
  return [
    `#[init(node = "${formatParentString(node)}")]`,
    `${toSnake(node.name.value)}: OnReady<Gd<${node.type?.value}>>,`,
  ];
};

const declGodotClassStart = (
  node: Node,
  withInit: boolean = true
): string[] => {
  return [
    "#[derive(GodotClass)]",
    `#[class(base=${node.type?.value}${withInit ? ",init" : ""})]`,
    `struct ${node.name.value} {`,
    `base: Base<${node.type?.value}>,`,
  ];
};

const declGodotClassEnd = (): string[] => {
  return ["}", "\n"];
};

const implVirtualMethodsStart = (node: Node): string[] => {
  return [`#[godot_api]`, `impl I${node.type?.value} for ${node.name.value} {`];
};

const implVirtualMethodsEnd = (): string[] => {
  return ["}"];
};

const classImports = (node: Node, otherClassesImports: string[]): string[] => {
  let imports = new Set([node.type?.value, ...otherClassesImports]);
  return [
    `use godot::{classes::{${[...imports].join(",")},I${
      node.type?.value
    }}, prelude::*,};\n`,
  ];
};

const node_methods = {
  init: "fn init(base: Base<Self::Base>) -> Self {}\n",
  ready: "fn ready(&mut self) {}\n",
  process: "fn process(&mut self, delta: f64) {}\n",
  physics_process: "fn physics_process(&mut self, delta: f64) {}\n",
  enter_tree: "fn enter_tree(&mut self) {}\n",
  exit_tree: "fn exit_tree(&mut self) {}\n",
  to_string: "fn to_string(&self) -> GString {}\n",
  input: "fn input(&mut self, event: Gd<InputEvent>) {}\n",
  shortcut_input: "fn shortcut_input(&mut self, event: Gd<InputEvent>) {}\n",
  unhandled_input: "fn unhandled_input(&mut self, event: Gd<InputEvent>) {}\n",
  unhandled_key_input:
    "fn unhandled_key_input(&mut self, event: Gd<InputEvent>) {}\n",
  on_notifcation: "fn on_notification(&mut self, what: NodeNotification) {}\n",
  // get_property:
  //   "fn get_property(&self, property: StringName) -> Option<Variant> {}",
  // set_property:
  //   "fn set_property(&mut self, property: StringName, value: Variant) -> bool {}",
  // get_property_list: "fn get_property_list(&mut self) -> Vec<PropertyInfo> {}",
  // validate_property:
  //   "fn validate_property(&self, property: &mut PropertyInfo) {}",
  // property_get_revert:
  //   "fn property_get_revert(&self, property: StringName) -> Option<Variant> {}",
  // get_configuration_warnings:
  //   "fn get_configuration_warnings(&self) -> PackedStringArray {}",
};

function formatParentString(node: Node) {
  return (
    (node.parent?.value === "." ? "" : node.parent?.value + "/") +
    node.name.value
  );
}
