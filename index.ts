import prompt from "prompt-sync";
import ImportFile from "./koto/services/ImportFile";
import Parser from "./koto/Parser";
import Interpreter from "./koto/Interpreter";
import System from "./koto/system/System";
import SystemNumber from "./koto/system/SystemNumber";
import SystemString from "./koto/system/SystemString";
import SystemException from "./koto/system/SystemException";

let showTree = true;
const report = (tree: Object) => console.log(JSON.stringify(tree, undefined, 3));

while (true) {
  const path = "bin/index.txt";
  const input = prompt({ sigint: true })(">> ") || ImportFile(path);
  if (input.toLowerCase() === "tree".toLowerCase()) {
    showTree = !showTree;
    continue;
  }
  try {
    const program = new Parser(input, path).parse();
    if (showTree) report(program);
    const system = new Interpreter().evaluate(program);
    if (system instanceof SystemNumber) report(system.value);
    else if (system instanceof SystemString) report(system.value);
    else report(system);
  } catch (err) {
    if (err instanceof System) report(err);
    else if (err instanceof SystemException) console.log(err.value);
    else console.log(err);
  }
}
