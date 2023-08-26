export default class Token {
  public name = this.constructor.name;
  constructor(public id: number = 0) {}
}
