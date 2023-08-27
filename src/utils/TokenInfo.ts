export default class TokenInfo {
  constructor(public start: number, public from: number, public to: number) {}

  logError(source: string, errorMessage: string) {
    const lineStartPosition = this.start;
    const tokenEndPosition = this.to - 1; // Correct the calculation here

    const lineIndexStart = source.substring(0, lineStartPosition).split("\n").length;
    const columnOffsetStart = lineStartPosition - source.lastIndexOf("\n", lineStartPosition - 1) - 1;

    const lineIndexEnd = source.substring(0, tokenEndPosition).split("\n").length;
    const columnOffsetEnd = tokenEndPosition - source.lastIndexOf("\n", tokenEndPosition - 1) - 1;

    const errorLine = source.split("\n")[lineIndexStart - 1];
    const errorPointer = " ".repeat(columnOffsetStart) + "~".repeat(columnOffsetEnd - columnOffsetStart) + "^";

    const errorDetails = `Error position ./dev/tests/test.txt:${lineIndexEnd}:${columnOffsetEnd + 1}:\n${errorMessage}\n\n${errorLine}\n${errorPointer}\n`;

    console.error(errorDetails);
  }
}
