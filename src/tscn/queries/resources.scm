;; exclude ext_resource type=Script since not relevant
(section 
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