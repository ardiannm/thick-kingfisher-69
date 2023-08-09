export default class Logger {
  constructor(public message: string, public from: number, public to: number) {
    this.message = `${this.constructor.name}: ${message}`;
  }
}
