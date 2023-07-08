export class Token {
  public token = this.constructor.name
    .replace(/([A-Z])/g, ".$1")
    .toLowerCase()
    .replace(/^\./, "");
}
