> A1 -> A4+1*-(4+A4)

└── ReferenceExpression
    ├── CellReference
    │   ├── IdentifierToken
    │   └── NumberToken
    └── BinaryExpression
        ├── CellReference
        │   ├── IdentifierToken
        │   └── NumberToken
        ├── PlusToken
        └── BinaryExpression
            ├── NumberToken
            ├── StarToken
            └── UnaryExpression
                ├── MinusToken
                └── ParenthesizedExpression
                    ├── OpenParenToken
                    ├── BinaryExpression
                    │   ├── NumberToken
                    │   ├── PlusToken
                    │   └── CellReference
                    │       ├── IdentifierToken
                    │       └── NumberToken
                    └── CloseParenToken