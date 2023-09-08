export default class SyntaxToken {
  public type = "tree." + this.constructor.name;
  constructor(public id?: number) {}
}
