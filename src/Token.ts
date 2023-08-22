export default class Token {
  public name = this.constructor.name;
  constructor(public gen: number) {}
}
