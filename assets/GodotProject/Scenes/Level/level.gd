extends Node2D

@export var level_name: String
var layout: LevelLayout 
@onready var tile_layers: Node2D = $TileLayers
@onready var floor_tiles: TileMapLayer = $TileLayers/Floor
@onready var walls_tiles: TileMapLayer = $TileLayers/Walls
@onready var targets_tiles: TileMapLayer = $TileLayers/Targets
@onready var boxes_tiles: TileMapLayer = $TileLayers/Boxes

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	level_name = GameManager.level_selected
	layout = LevelData.get_level_data(level_name)
	
	print("level : %s" % level_name)
	print(floor_tiles.get_used_cells())
	print(floor_tiles.get_used_rect())
	print(floor_tiles.get_used_rect().get_center())
	print(floor_tiles.tile_set.tile_size.x)
	
	floor_tiles.erase_cell(Vector2i(8,7))
	floor_tiles.set_cell(Vector2i(7,7),0, Vector2i(2,0))
	floor_tiles.clear()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("exit"):
		GameManager.load_main_scene()
	elif event.is_action_pressed("reload"):
		get_tree().reload_current_scene()


func setup_tiles():
	pass
	#
#func get_tile(ltype: TileLayers.LayerType):
	#match ltype:
		#TileLayers.LayerType.Floor:
			#return Vector2i(randi(3,9),0 )
		#TileLayers.LayerType.Boxes:
			#return Vector2i(,0 )
				#
		
