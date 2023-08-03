export default class LogError {
  constructor(public message: string) {
    this.message = `${this.constructor.name}: ${message}`;
  }
}
