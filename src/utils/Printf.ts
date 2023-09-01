import Location from "./Location";

export default class Printf {
  constructor(public from: Location, public to: Location) {}

  public printf(source: string, errorMessage: string) {
    console.log();
    console.log(`error: ${errorMessage}`);
    console.log(`-- ./dev/tests/tests.txt:${this.to.line}:${this.to.column}`);
    console.log();
    console.log(`${this.to.line}`.replace(/./g, " ") + " | ");
    console.log(this.to.line + " | " + source.split("\n")[this.to.line - 1]);

    const from = `${this.from.line}:${this.to.column}`;
    const to = `${this.to.line}:${this.to.column}`;
    const info = from === to ? `at position ${to}` : `starting from ${this.from.line}:${this.to.column}, ending to ${this.to.line}:${this.to.column}`

    console.log(`${this.to.line}`.replace(/./g, " ") + " | " + " ".repeat(this.to.column - 1) + " -- " +  `${info}`);
    console.log();
  }
}
