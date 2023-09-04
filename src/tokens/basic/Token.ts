export default class Token {
  public type = this.constructor.name;
  constructor(public id?: number) {}
}
