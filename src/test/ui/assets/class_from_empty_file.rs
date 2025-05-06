use godot::{classes::{NinePatchRect,Label,TextureRect,INinePatchRect}, prelude::*,};

#[derive(GodotClass)]
#[class(base=NinePatchRect,init)]
struct LevelButton {
base: Base<NinePatchRect>,
#[init(node = "LevelLabel")]
level_label: OnReady<Gd<Label>>,
#[init(node = "CheckMark")]
check_mark: OnReady<Gd<TextureRect>>,
}


#[godot_api]
impl INinePatchRect for LevelButton {
fn ready(&mut self) {}
fn enter_tree(&mut self) {}
}