use godot::{
    classes::{Camera2D, INode2D, Node2D, Sprite2D},
    prelude::*,
};

#[derive(GodotClass)]
#[class(base=Node2D,init)]
pub struct Child1Struct {
    base: Base<Node2D>,
    #[init(node = "AChild1/AAChild1")]
    a_a_child_1: OnReady<Gd<Camera2D>>,
    #[init(node = "AChild1/AAChild1/AAAChild1")]
    a_a_a_child_1: OnReady<Gd<Sprite2D>>,
}

#[godot_api]
impl INode2D for Child1Struct {
    fn ready(&mut self) {}
    fn process(&mut self, delta: f64) {}
}
