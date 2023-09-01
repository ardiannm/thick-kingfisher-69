export default class Token {
  protected type = this.constructor.name;
  constructor(public id?: number) {}
}
