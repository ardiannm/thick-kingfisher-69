import { Highlighter } from "./highlighter.ts";
import { loggerLog } from "./logger.ts";
import { Parser } from "./parser.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Highlighter(input);

  tree.generate();

  const parser = new Parser(input);
  const token = parser.parseAddition();

  loggerLog(token);

  const format = token.prettyPrint();
  console.log(format);

  console.log("\n\n");
}
