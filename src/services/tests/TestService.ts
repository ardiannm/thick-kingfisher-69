import Parser from "../../Parser";
import ImportFile from "../ImportFile";
import { ColorCode } from "../ParserService";
import DirectoryFiles from "./DirectoryFiles";

export default class TestService {
  private paths = new Array<string>();

  public loadDirectoryFiles(source: string) {
    this.paths = DirectoryFiles(source);
    return this;
  }

  public run() {
    return this.paths.map((path) => {
      try {
        const input = ImportFile(path);
        new Parser(input, input).parse();
        return new TestResult(true, path);
      } catch (error) {
        return new TestResult(false, path, error);
      }
    });
  }
}

class TestResult {
  constructor(public success: boolean, public sourceCode: string, public result: string = "PASSED!!!") {
    this.sourceCode = this.colorize(this.sourceCode, ColorCode.Blue);
    if (success) {
      this.result = this.colorize(this.result, ColorCode.Green);
    } else {
      this.result = this.colorize("FAILED!!!\n" + this.result, ColorCode.Red);
    }
  }

  private colorize(text: string, startColor: ColorCode, endColor = ColorCode.White) {
    return `${startColor}${text}${endColor}`;
  }
}
