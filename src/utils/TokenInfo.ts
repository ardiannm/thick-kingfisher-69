export default class TokenInfo {
  constructor(public start: number, public from: number, public to: number) {}

  logError(source: string, errorMessage: string) {
    const lineStartPosition = this.start;
    const tokenEndPosition = this.to;

    const lineIndexStart = source.substring(0, lineStartPosition).split("\n").length;
    const columnOffsetStart = lineStartPosition - source.lastIndexOf("\n", lineStartPosition - 1) - 1;

    const lineIndexEnd = source.substring(0, tokenEndPosition).split("\n").length;
    const columnOffsetEnd = this.from - source.lastIndexOf("\n", this.from);

    const errorLine = source.split("\n")[lineIndexStart - 1];
    const errorPointer = " ".repeat(columnOffsetStart) + "~".repeat(columnOffsetEnd - columnOffsetStart - 1) + "^";

    const errorDetails = `\nException, ${errorMessage}, at position ./dev/tests/test.txt:${lineIndexEnd}:${columnOffsetEnd + 1}:\n\n\t${errorLine}\n\t${errorPointer}\n`;

    console.error(errorDetails);
  }
}
