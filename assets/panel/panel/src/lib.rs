use godot::prelude::*;
mod child_1;
mod other;

struct PanelExtension;

#[gdextension]
unsafe impl ExtensionLibrary for PanelExtension {}
