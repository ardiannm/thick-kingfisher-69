import Location from "./Location";

export default class Logger {
  constructor(public from: Location, public to: Location) {}

  public log(source: string, errorMessage: string) {
    const target = source.split("\n")[this.from.line - 1];
    const lineNumber = `${this.from.line}|    `;
    const ouput = {
      errorMessage,
      out: "\n".repeat(2) + lineNumber + target + "\n" + " ".repeat(lineNumber.length) + " ".repeat(this.from.column - 1) + "^".repeat(this.to.column - this.from.column),
    };
    console.log(ouput.out);
  }
}
