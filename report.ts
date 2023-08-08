export default class Report {
  constructor(public message: string) {
    this.message = `${this.constructor.name}: ${message}`;
  }
}
