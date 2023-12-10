import * as fs from "fs";
import * as path from "path";

import { Diagnostic } from "../CodeAnalysis/Diagnostics/Diagnostic";
import { SyntaxTree } from "../CodeAnalysis/Syntax/SyntaxTree";
import { Binder } from "../Binder";
import { Environment } from "../Environment";
import { Evaluator } from "../Evaluator";

import Promp from "readline-sync";

const report = (Obj: string = "") => {
  const Format = typeof Obj === "string" ? Obj : JSON.stringify(Obj, undefined, 2);
  console.log(Format);
  return Obj;
};

export class Interpreter {
  private Environment = new Environment();

  private LoadSource(): string {
    const FullPath = path.normalize(path.join(".", "src", "IO", ".lang"));
    return fs.readFileSync(FullPath, "utf8");
  }

  Run(): void {
    let InputBuffer = report(this.LoadSource()).trim().split("\n");

    while (true) {
      const InputLine = Promp.question("> ");

      // Provide a way to exit the loop
      if (InputLine.toLowerCase() === "exit") {
        break;
      }

      if (InputLine.trim()) {
        // Concatenate the input to the buffer
        InputBuffer.push(InputLine);
      }

      const Input = InputBuffer.join("\n");

      try {
        const Tree = SyntaxTree.Bind(Input, this.Environment);
        const Evaluation = new Evaluator(this.Environment).Evaluate(Tree);
        report(JSON.stringify(Evaluation) + "\n");
      } catch (error) {
        report(Input);
        report((error as Diagnostic).Message + "\n");
      }
    }
  }
}
