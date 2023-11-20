> A1 -> -(1+A5)*A7+1--2

└── ReferenceExpression
    ├── CellReference
    │   ├── IdentifierToken
    │   └── NumberToken
    └── UnaryExpression
        ├── MinusToken
        └── BinaryExpression
            ├── BinaryExpression
            │   ├── BinaryExpression
            │   │   ├── ParenthesizedExpression
            │   │   │   ├── OpenParenToken
            │   │   │   ├── BinaryExpression
            │   │   │   │   ├── NumberToken
            │   │   │   │   ├── PlusToken
            │   │   │   │   └── CellReference
            │   │   │   │       ├── IdentifierToken
            │   │   │   │       └── NumberToken
            │   │   │   └── CloseParenToken
            │   │   ├── StarToken
            │   │   └── CellReference
            │   │       ├── IdentifierToken
            │   │       └── NumberToken
            │   ├── PlusToken
            │   └── NumberToken
            ├── MinusToken
            └── UnaryExpression
                ├── MinusToken
                └── NumberToken

