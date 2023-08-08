import Read from "./dev/helper/read.ts";
import Write from "./dev/helper/write.ts";

import Lexer from "./lexer.ts";
import Parser from "./parser.ts";
import Interpreter from "./interpreter.ts";

while (true) {
  const request = await Read("./dev/template.html");
  const input = prompt(">>") || request;
  const interpreter = new Interpreter(input);
  const runtime = interpreter.run();

  Write({ errors: runtime, parser: interpreter.tree }, "./dev/template.json");

  console.log(runtime);
}

export { Lexer, Parser, Interpreter };
