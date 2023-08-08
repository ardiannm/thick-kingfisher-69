import Report from "./report.ts";

export default class ParserError extends Report {
  constructor(public message: string) {
    super(message);
  }
}
