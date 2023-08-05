import Interpreter from "../interpreter.ts";

const Write = (obj: Interpreter) => {
  Deno.writeTextFile("./dev/log.json", JSON.stringify(obj, null, 3));
};

export default Write;
