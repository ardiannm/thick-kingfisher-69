import { Division } from "./division.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Plus } from "./plus.ts";
import { Number } from "./number.ts";
import { Identifier } from "./identifier.ts";

export type Operator = Plus | Minus | Division | Multiplication
export type Expression = Number | Identifier

export class Binary {
    constructor(public left: Expression, public operator: Operator, public right: Expression) { }
}