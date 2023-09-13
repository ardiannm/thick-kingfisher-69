import Parser from "../../Parser";
import ImportFile from "../ImportFile";
import { Color as Color } from "../ParserService";
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
    this.path = this.colorize(this.path, Color.Blue);
    if (success) {
      this.result = this.path + this.colorize(" PASSED!!!", Color.Green) + this.result;
    } else {
      this.result = this.path + this.colorize(" FAILED!!!", Color.Red) + this.result;
    }
  }

  private colorize(text: string, startColor: Color, endColor = Color.White) {
    return `${startColor}${text}${endColor}`;
  }
}
