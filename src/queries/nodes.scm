;; Parse node header
(section 
    (identifier) @section (#eq? @section "node")
    .
    ([
        (;; a root node
            (attribute 
                (identifier) @keyname (#eq? @keyname "name")
                (string) @name
            )
            (attribute 
                (identifier) @keytype (#eq? @keytype "type") 
                (string) @type 
            )
        )
        (;; a subnode
            (attribute 
                (identifier) @keyname (#eq? @keyname "name")
                (string) @name
            )
            (
                [
                (attribute 
                    (identifier) @keytype (#eq? @keytype "type") 
                    (string) @type 
                )
                (attribute 
                    (identifier) @keyParent (#eq? @keyParent "parent") 
                    (string) @parent
                )
                ]
            )
            (   
                [
                (attribute ;; classic sub node
                    (identifier) @keyParent (#eq? @keyParent "parent") 
                    (string) @parent
                )
                (attribute ;; depedency node
                    (identifier) @instance (#eq? @instance "instance")
                    
                    (constructor
                        (identifier) @constructor
                        (arguments
                            (string) @resId
                        )
                    )
                )
                ]
            )    
        )
    
    ])
)