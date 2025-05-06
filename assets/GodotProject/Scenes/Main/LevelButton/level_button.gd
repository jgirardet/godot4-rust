extends NinePatchRect

@export var level_name: String
@onready var level_label: Label = $LevelLabel
@onready var button: Button = $Button

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	level_label.text = level_name


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_button_pressed() -> void:
	GameManager.load_level_scene(level_name)
