export default class Token {
  public token = this.constructor.name.replace(/[A-Z]/g, " $&").trim().replace(/ /, "-").toLowerCase();
  constructor(public from: number, public to: number) {}
}
