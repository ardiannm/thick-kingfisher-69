export default class Token {
  public type = this.constructor.name.replace(/[A-Z]/g, (match) => ` ${match}`).trim();
}
