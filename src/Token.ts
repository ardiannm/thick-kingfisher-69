export default class Token {
  public name = this.constructor.name;
  constructor(public token: number = 0) {}
}
