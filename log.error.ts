export default class ErrorMessage {
  constructor(public message: string) {
    this.message = `${this.constructor.name}: ${message}`;
  }
}
