ReferenceExpression
├── CellReference
│   ├── IdentifierToken A
│   └── NumberToken 1
├── Referencing
│   ├── A2
│   └── A3
└── Expression
    ├── BinaryExpression
    │   ├── CellReference
    │   │   ├── IdentifierToken A
    │   │   └── NumberToken 2
    │   ├── PlusToken +
    │   └── CellReference
    │       ├── IdentifierToken A
    │       └── NumberToken 3
    └──


{
  Kind: ReferenceExpression,
  Reference: {
    Kind: CellReference,
    Left: {
      Kind: IdentifierToken,
      Text: A
    },
    Right: {
      Kind: NumberToken,
      Text: 1
    }
  },
  Referencing: [
    A2,
    A3
  ],
  Expression: {
    Kind: BinaryExpression,
    Left: {
      Kind: CellReference,
      Left: {
        Kind: IdentifierToken,
        Text: A
      },
      Right: {
        Kind: NumberToken,
        Text: 2
      }
    },
    Operator: {
      Kind: PlusToken,
      Text: +
    },
    Right: {
      Kind: CellReference,
      Left: {
        Kind: IdentifierToken,
        Text: A
      },
      Right: {
        Kind: NumberToken,
        Text: 3
      }
    }
  }
}