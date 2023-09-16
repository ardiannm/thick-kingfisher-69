import Parser from "../../Parser";
import ImportFile from "../ImportFile";
import DirectoryFiles from "./DirectoryFiles";
import Color, { colorize } from "../Color";

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
        new Parser(input, path).parse();
        return new TestResult(true, path);
      } catch (error) {
        return new TestResult(false, path, error);
      }
    });
  }

  public colorize(text: string, startColor: Color, endColor = Color.White) {
    return `${startColor}${text}${endColor}`;
  }
}

class TestResult {
  constructor(public success: boolean, public path: string, public result = "") {
    this.path = colorize(this.path, Color.Blue);
    if (success) {
      this.result = this.path + colorize(" PASSED!!!", Color.Green) + this.result;
    } else {
      this.result = this.path + colorize(" FAILED!!!", Color.Red) + this.result;
    }
  }
}
