import { Node } from "../node.definition.ts";

export class ErrorNode extends Node {
  constructor(public font: string) {
    super();
  }
}
