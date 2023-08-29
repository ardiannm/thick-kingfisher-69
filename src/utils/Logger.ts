import Location from "./Location";

export default class Logger {
  constructor(public from: Location, public to: Location) {}

  public log(source: string, errorMessage: string) {
    const target = source.split("\n")[this.from.line - 1];
    const lineNumber = `${this.from.line}   `;
    const ouput = "\n".repeat(1) +  `Exception: ${errorMessage} ...` + "\n".repeat(2) + lineNumber + target + "\n" + " ".repeat(lineNumber.length) + " ".repeat(this.from.column - 1) + ("^".repeat(this.to.column - this.from.column) || "^") + "\n".repeat(4);
    console.log(ouput);
  }
}
