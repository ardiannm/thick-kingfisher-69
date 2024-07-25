export class Diagnostic {
  private constructor(public message: string) {}

  public static createFrom(message: string) {
    return new Diagnostic(message);
  }
}
