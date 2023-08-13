export default class Logger {
  private error = this.constructor.name;
  constructor(public message: string, public atPosition: number) {
    this.message = `${this.constructor.name}: ${message}, at position ${atPosition}`;
  }
}
