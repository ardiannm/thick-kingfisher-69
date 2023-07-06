import { Expression, Operator } from "./language.ts";

export class Binary {
    constructor(public left: Expression, public operator: Operator, public right: Expression) { }
}