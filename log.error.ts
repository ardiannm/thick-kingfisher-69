export class LogError {
  constructor(public message: string, public position: number) {
    this.message = `${this.constructor.name}: ${message}, at position ${position}.`;
  }
}
