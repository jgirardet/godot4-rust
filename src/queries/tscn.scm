
(resource
    (
    (section
      .
        (identifier) @gdscene (#eq? @gdscene "gd_scene")
        (attribute)+
        (attribute 
            (identifier)
            (string) @ruid (#match? @ruid "^\"uid.+")
        ).
    )
    .
    (
    [
    (section ;; exclude ext_resource type=Script since not relevant
      
        (identifier) @section (#eq? @section "ext_resource")
        (attribute 
            (identifier) @keyType (#eq? @keyType "type") 
            (string) @type 
        )
        (attribute 
            (identifier) @keyUid (#eq? @keyUid "uid")
            (string) @uid
        )
        (attribute 
            (identifier) @keyPath (#eq? @keyPath "path") 
            (string) @path
        )
        (attribute 
            (identifier) @keyId (#eq? @keyId "id") 
            (string) @id
        )
    )
    (section ;; exclude ext_resource type=Script since not relevant
      
        (identifier);; @section (#eq? @section "ext_resource")
        (attribute 
            (identifier);; @keyType (#eq? @keyType "type") 
            (string) ;;@type 
        )
        (attribute 
            (identifier) ;; @keyPath (#eq? @keyPath "path") 
            (string) ;;@path
        )
        (attribute 
            (identifier) ;;@keyId (#eq? @keyId "id") 
            (string) ;;@id
        )
    )
    ])*
    .
    (section ;; nodes Root
      .
        (identifier) @sectionn (#eq? @sectionn "node")
        .
        (attribute 
            (identifier) @keynamen (#eq? @keynamen "name")
            (string) @namen
        )
        .
        (attribute 
            (identifier) @keytypen (#eq? @keytypen "type") 
            (string) @typen 
        )
    )
    .
    (section
        . 
        (
        (identifier) @sectionNodes (#eq? @sectionNodes "node")
        .
        (attribute 
            ;; (identifier) @keynamena (#eq? @keynamena "name")
    ;;         ;; "="
            (string) @namea
    ;;     )
        )
        
        .
        (attribute 
    ;;         ;; (identifier) @keytypena (#eq? @keytypena "type") 
            (string) @typen 
        )
        [
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
    )*
    
    )
    ;; .

    
)