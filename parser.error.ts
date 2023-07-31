export class ParserError {
  constructor(public message: string) {
    this.message = `ParserError: ${message}.`;
  }
}
