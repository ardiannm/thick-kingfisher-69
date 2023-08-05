import Interpreter from "../interpreter.ts";
import LogError from "../log.error.ts";
import Token from "../token.ts";

class Logger {
  constructor(public input: string, public logger: Array<LogError>, public tree: Token) {}
}

const Write = (out: Interpreter) => {
  Deno.writeTextFile("./dev/log.json", JSON.stringify(new Logger(out.input, out.logger, out.tree), null, 3));
};

export default Write;
