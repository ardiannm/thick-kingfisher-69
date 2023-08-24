export default class Exception {
  public name = this.constructor.name;
  constructor(public message: string) {}
}
