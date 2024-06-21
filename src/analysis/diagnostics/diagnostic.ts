export class Diagnostic {
  private constructor(public message: string) {}

  static from(message: string) {
    return new Diagnostic(message);
  }
}
