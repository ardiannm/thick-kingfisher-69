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
    const SourceContent = report(this.LoadSource());
    while (true) {
      const Input = Promp.question("> ") || SourceContent;
      try {
        const Tree = SyntaxTree.Bind(Input, this.Environment);
        const Evaluation = new Evaluator(this.Environment).Evaluate(Tree);
        report(JSON.stringify(Evaluation) + "\n");
      } catch (error) {
        report((error as Diagnostic).Message + "\n");
      }
    }
  }
}
