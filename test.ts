import { Color } from "./src/services/ParserService";
import TestService from "./src/services/tests/TestService";

const service = new TestService();
const res = service.loadDirectoryFiles("bin").run();

res.forEach((res) => {
  let str = `${res.sourceCode}\n${res.result}`;
  const n = Math.max(...str.split("\n").map((s) => s.length));
  str += service.colorize("\n" + "-".repeat(n), Color.DimSkyBlue);
  console.log(str);
});
