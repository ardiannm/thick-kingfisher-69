import { Node } from "../node-definition";

export class StatementNode extends Node {
  constructor(public statments: Array<Node>) {
    super();
  }
}
