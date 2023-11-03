import prompt from "prompt-sync";
import Interpreter from "./src/Interpreter";
import Parser from "./src/Parser";
import SystemNumber from "./src/system/SystemNumber";
import Environment from "./src/Environment";

var showTree = false;
var doEvaluate = true;

var environment = Environment();

const interpreter = Interpreter(environment);

const report = (tree: Object) => console.log(JSON.stringify(tree, undefined, 3));

console.log(`   - tree ${showTree ? "is" : "is not"} active for logging`);
console.log(`   - interpreter ${doEvaluate ? "will" : "won't"} be evaluating`);
console.log();

while (true) {
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
    const tree = Parser(input, environment.references).parseReference();
    if (showTree) report(tree);
    if (doEvaluate) {
      const v = interpreter.evaluate(tree) as SystemNumber;
      report(v);
    }
  } catch (err) {
    console.log(err);
  }
  console.log();
}
