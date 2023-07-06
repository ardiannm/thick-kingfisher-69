import { Division } from "./division.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Plus } from "./plus.ts";
import { Number } from "./number.ts";
import { Identifier } from "./identifier.ts";
import { DoubleQuoteString } from "./double.quote.string.ts";
import { BinaryOperation } from "./binary.operation.ts";
import { UnaryOperation } from "./unary.operation.ts";

export type IdentifierOrNumber = Identifier | Number
export type Operator = Plus | Minus | Division | Multiplication
export type Expression = IdentifierOrNumber | BinaryOperation | UnaryOperation | DoubleQuoteString