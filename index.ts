import prompt from "prompt-sync";
import ReadFile from "./dev/ReadFile";
import Parser from "./src/Parser";
import Interpreter from "./src/Interpreter";
import RuntimeNumber from "./src/runtime/RuntimeNumber";

let showTree = true;
const report = (tree: Object) => console.log(JSON.stringify(tree, undefined, 3));

while (true) {
  const input = prompt({ sigint: true })(">> ") || ReadFile();
  if (input.toLowerCase() === "tree".toLowerCase()) {
    showTree = !showTree;
    continue;
  }
  try {
    const program = new Parser(input).parse();
    if (showTree) report(program);
    const runtime = new Interpreter().evaluate(program);
    report(runtime instanceof RuntimeNumber ? runtime.value : runtime);
  } catch (report) {
    console.log(report);
  }
}
