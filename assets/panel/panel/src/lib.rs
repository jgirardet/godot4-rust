use godot::prelude::*;
mod child_1;

struct PanelExtension;

#[gdextension]
unsafe impl ExtensionLibrary for PanelExtension {}
