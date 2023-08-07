export default class Token {
  public token = this.constructor.name;
  constructor(public from: number, public to: number) {}
}
