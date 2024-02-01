import { SyntaxTree } from "./src/CodeAnalysis/Parsing/SyntaxTree";
import { CompilerOptions } from "./src/CompilerOptions/CompilerOptions";
import { createInterface } from "readline";

const Prompt = createInterface({ input: process.stdin, output: process.stdout });
const Submission = SyntaxTree.Init(new CompilerOptions(true, false));

console.clear();

const Submissions = new Array<string>();

const Fn = () => {
  Prompt.question("", function (Input) {
    if (Input === "q") {
      Prompt.close();
    } else if (Input === "a") {
      console.clear();
      Fn();
    } else if (Input !== "") {
      Submissions.push(Input);
      Fn();
    } else {
      Input = Submissions.join("\n");
      Submissions.length = 0;
      Submission.Parse(Input).Print().Bind().Evaluate();
      if (Submission.Diagnostics.Any()) {
        console.log();
        for (const d of Submission.Diagnostics.Get()) console.log(d);
        Submission.Diagnostics.Clear();
      } else {
        console.log();
        console.log(Submission.Value.toString());
      }
      console.log();
      Fn();
    }
  });
};

Fn();
