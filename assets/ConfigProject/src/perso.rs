use godot::{
    classes::{CharacterBody2D, ICharacterBody2D, Sprite2D},
    prelude::*,
};

struct Bla {
    x: String,
}

#[derive(GodotClass)]
#[class(base=CharacterBody2D,init)]
///fzefz ef zef zefzef
// fzefzefzef
pub struct Perso {
    base: Base<CharacterBody2D>,
    #[init(node = "Sprite2D")]
    sprite_2_d: OnReady<Gd<Sprite2D>>,
}

#[godot_api]
impl ICharacterBody2D for Perso {
    fn ready(&mut self) {
        self.base_mut().rotate(3.0);
    }
    fn process(&mut self, delta: f64) {
        self.base_mut().translate(Vector2 { x: 34.0, y: 33.0 });
    }
    fn exit_tree(&mut self) {
        godot_print!("C'est un log")
    }
}

#[godot_api]
impl Perso {
    fn une_fonction() -> i32 {
        4
    }
}
