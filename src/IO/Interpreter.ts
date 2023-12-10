import * as fs from "fs";
import * as path from "path";

import { Diagnostic } from "../CodeAnalysis/Diagnostics/Diagnostic";
import { SyntaxTree } from "../CodeAnalysis/SyntaxTree";
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
  private Env = new Environment();

  private LoadSource(): string {
    const FullPath = path.normalize(path.join(".", "src", "IO", ".lang"));
    return fs.readFileSync(FullPath, "utf8");
  }

  Run(): void {
    while (true) {
      const Input = Promp.question("> ") || report(this.LoadSource());
      try {
        const Output = new Binder(this.Env).Bind(SyntaxTree.Parse(Input));
        const Value = new Evaluator(this.Env).Evaluate(Output);
        report(JSON.stringify(Value) + "\n");
      } catch (error) {
        report((error as Diagnostic).Message + "\n");
      }
    }
  }
}
