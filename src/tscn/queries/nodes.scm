;; Parse node header
(section 
    (identifier) @section (#eq? @section "node")
    (
    [
    (attribute 
        (identifier) @keyType (#eq? @keyType "type") 
        (string) @type 
    )
    (attribute 
        (identifier) @keyName (#eq? @keyName "name")
        (string) @name
    )
    (attribute 
        (identifier) @keyParent (#eq? @keyParent "parent") 
        (string) @parent
    )?
    (attribute 
        (identifier) @instance (#eq? @instance "instance")
         
        (constructor
            (identifier) @constructor
            (arguments
                (string) @resId
            )
        )
    )?
    ]
    )*
    
)