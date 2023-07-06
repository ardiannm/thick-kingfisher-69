export class Token {
  token = this.constructor.name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
  public value: string
  constructor(value: string) {
    this.value = value 
  }
}

