export default class Token {
  public type = "tree." + this.constructor.name;
  constructor(public id?: number) {}
}
