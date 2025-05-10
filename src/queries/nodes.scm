;; Parse node header
(section 
    (identifier) @section (#eq? @section "node")
    .
    ([
        (
            (attribute 
                (identifier) @keyname (#eq? @keyname "name")
                (string) @name
            )
            (attribute 
                (identifier) @keytype (#eq? @keytype "type") 
                (string) @type 
            )
        )
        (
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
            (   [
                (attribute 
                    (identifier) @keyParent (#eq? @keyParent "parent") 
                    (string) @parent
                )
                (attribute 
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