export default class Token {
  public tagName = this.constructor.name;
  constructor(public id?: number) {}
}
