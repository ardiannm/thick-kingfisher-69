export default class Locator {
  constructor(public startLine: number, public startColumn: number, public endLine: number, public endColumn: number) {}

  public printf(source: string, errorMessage: string) {
    console.log();
    console.log(`error: ${errorMessage}`);
    console.log(` -- ./dev/tests/tests.txt:${this.endLine}:${this.endColumn}`);
    console.log();
    console.log(`${this.endLine}`.replace(/./g, " ") + " | ");
    console.log(this.endLine + " | " + source.split("\n")[this.endLine - 1]);

    const from = `${this.startLine}:${this.endColumn}`;
    const to = `${this.endLine}:${this.endColumn}`;
    let info = "";

    if (from === to) {
      info = `at position ${to}`;
    } else {
      info = `starting from ${from}, ending to ${to}`;
    }

    console.log(`${this.endLine}`.replace(/./g, " ") + " | " + " ".repeat(this.endColumn - 1) + " -- " + `${info}`);
    console.log();
  }
}
