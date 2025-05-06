extends Control

const LEVEL_BUTTON = preload("res://Scenes/Main/LevelButton/level_button.tscn")
@onready var grid: GridContainer = $MC/VB/Grid


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	for n in LevelData.level_names().slice(0,30):
		var l = LEVEL_BUTTON.instantiate()
		l.level_name = n
		grid.add_child(l)
		


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass
