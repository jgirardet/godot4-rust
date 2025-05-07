(
  (attribute_item
    (attribute 
      (identifier) @derive  (#eq? @derive "derive")
      arguments: (token_tree
        (identifier) @godotclass
        (#eq? @godotclass "GodotClass")
      )
    )
  )
  .
  [
    (attribute_item)
    (line_comment)
  ]*
  .
    (attribute_item
        (attribute 
            (identifier) @class (#eq? @class "class")
            arguments: (token_tree
                (
                    (identifier)  @baseKw (#eq? @baseKw  "base")
                    .
                    "="
                    .
                    (identifier) @baseClass
                )?
               ( 
                (identifier) @init (#eq? @init "init")
                )?
            )
        )
    )?
  .
  [
      (attribute_item)
      (line_comment)
  ]*
  .
  (struct_item 
    name: (type_identifier) @className
  )
)