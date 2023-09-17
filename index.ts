import prompt from "prompt-sync";
import Parser from "./src/Parser";
import Interpreter from "./src/Interpreter";
import System from "./src/system/System";
import SystemNumber from "./src/system/SystemNumber";
import SystemString from "./src/system/SystemString";
import SystemException from "./src/system/SystemException";

let showTree = false;
let doEvaluate = false;
const report = (tree: Object) => console.log(JSON.stringify(tree, undefined, 3));

console.log(`   - tree ${showTree ? "is" : "is not"} active for logging`);
console.log(`   - interpreter ${doEvaluate ? "will" : "won't"} be evaluating`);
console.log();

while (true) {
  const path = "bin/index.txt";

  const input = prompt({ sigint: true })("> ");
  if (input.toLowerCase() === "tree".toLowerCase()) {
    showTree = !showTree;
    console.log();
    console.log(`   - tree ${showTree ? "is now active" : "is now inactive"} for logging`);
    console.log();
    continue;
  }
  if (input.toLowerCase() === "interpreter".toLowerCase()) {
    doEvaluate = !doEvaluate;
    console.log();
    console.log(`   - interpreter ${doEvaluate ? "is ready for evaluation" : "is deactivated"}`);
    console.log();
    continue;
  }
  console.log();
  try {
    const parser = new Parser(input, path);
    const program = parser.parse();
    console.log(program.toString());
    if (showTree) report(program);
    if (doEvaluate) {
      const system = new Interpreter().evaluate(program);
      if (system instanceof SystemNumber) report(system.value);
      else if (system instanceof SystemString) report(system.value);
      else report(system);
    }
  } catch (err) {
    if (err instanceof System) report(err);
    else if (err instanceof SystemException) console.log(err.value);
    else console.log(err);
  }
  console.log();
}
