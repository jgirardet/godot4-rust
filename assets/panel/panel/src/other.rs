use godot::{
    classes::{Camera2D, INode2D, Node2D, Sprite2D},
    prelude::*,
};

use crate::child_1::Child1Struct;

#[derive(GodotClass)]
#[class(base=Node2D,init)]
struct Other {
    base: Base<Node2D>,
    #[init(node = "Other1/Other11")]
    other_11: OnReady<Gd<Camera2D>>,
    #[init(node = "Other1/Other11/Other111")]
    other_111: OnReady<Gd<Sprite2D>>,
    #[init(node = "Other1/Other11/Other111/Child1")]
    child_1: OnReady<Gd<Child1Struct>>,
}

#[godot_api]
impl INode2D for Other {
    fn ready(&mut self) {}
    fn process(&mut self, delta: f64) {}
}
