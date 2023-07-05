export abstract class Token {
  public type = this.constructor.name.replace(/Token$/, "");
  constructor(public font: string) {}
}
