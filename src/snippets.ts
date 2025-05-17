import { toSnake } from "ts-case-convert";
import { NodeItem } from "./panel/nodeItem";
import { GODOT_STRUCTS, GODOT_VIRTUAL_METHODS } from "./godotClasses";

export {
  onready_snippet,
  node_methods,
  implVirtualMethodsStart,
  implVirtualMethodsEnd,
  declGodotClassEnd,
  declGodotClassStart,
  classImports,
};

const onready_snippet = (nodeItem: NodeItem): string[] => {
  return [
    `#[init(node = "${formatParentString(nodeItem)}")]`,
    `${toSnake(nodeItem.name)}: OnReady<Gd<${formatType(nodeItem)}>>,`,
  ];
};

const declGodotClassStart = (
  nodeItem: NodeItem,
  withInit: boolean = true
): string[] => {
  let struct = formatType(nodeItem);
  return [
    "#[derive(GodotClass)]",
    `#[class(base=${struct}${withInit ? ",init" : ""})]`,
    `pub struct ${nodeItem.name} {`,
    `base: Base<${struct}>,`,
  ];
};

const declGodotClassEnd = (): string[] => {
  return ["}", "\n"];
};

const implVirtualMethodsStart = (nodeItem: NodeItem): string[] => {
  return [
    `#[godot_api]`,
    `impl ${
      GODOT_VIRTUAL_METHODS[nodeItem.type as keyof typeof GODOT_VIRTUAL_METHODS]
    } for ${nodeItem.name} {`,
  ];
};

const implVirtualMethodsEnd = (): string[] => {
  return ["}"];
};

const classImports = (
  nodeItem: NodeItem,
  otherClassesImports: string[]
): string[] => {
  let imports = new Set([formatType(nodeItem), ...otherClassesImports]);
  return [
    `use godot::{classes::{${[...imports].join(",")},${
      GODOT_VIRTUAL_METHODS[nodeItem.type as keyof typeof GODOT_VIRTUAL_METHODS]
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

function formatParentString(node: NodeItem) {
  return (node.path === "." ? "" : node.path + "/") + node.name;
}

function formatType(nodeItem: NodeItem) {
  return (
    GODOT_STRUCTS[nodeItem.type as keyof typeof GODOT_STRUCTS] || nodeItem.type
  );
}
