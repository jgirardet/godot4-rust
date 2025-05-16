use godot::{
    classes::{Camera2D, INode2D, Node2D, Sprite2D},
    prelude::*,
};

#[derive(GodotClass)]
#[class(base=Node2D,init)]
pub struct Child1Struct {
    base: Base<Node2D>,
}

#[godot_api]
impl INode2D for Child1Struct {
    fn ready(&mut self) {}
    fn process(&mut self, delta: f64) {}
}
