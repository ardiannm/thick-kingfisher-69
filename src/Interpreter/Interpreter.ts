import * as fs from "fs";
import * as path from "path";

import { Diagnostic } from "../CodeAnalysis/Diagnostics/Diagnostic";
import { SyntaxTree } from "../CodeAnalysis/Syntax/SyntaxTree";
import { Environment } from "../Environment";
import { Evaluator } from "../Evaluator";
import { DiagnosticCode } from "../CodeAnalysis/Diagnostics/DiagnosticCode";

import Promp from "readline-sync";

export class Interpreter {
  private Env = new Environment();
  private Buffer = new Array<string>();
  private Width = 0;

  Run() {
    console.clear();

    while (true) {
      const InputLine = Promp.question("> ");
      this.Width = Math.max(this.Width, InputLine.length);

      console.clear();

      if (InputLine.toLowerCase() === "cls") {
        console.clear();
        this.Buffer.pop();
        const Message = this.Buffer.length > 0 ? "Interpreter: Line " + (this.Buffer.length + 1) + " removed." : "";
        this.Print(this.Input(), Message);
        continue;
      }

      if (InputLine.toLowerCase() === "reset") {
        this.Buffer.length = 0;
        console.clear();
        continue;
      }

      if (InputLine.toLowerCase() === "exit") {
        break;
      }

      if (InputLine.trim()) {
        this.Buffer.push(InputLine);
      }

      try {
        const Tree = SyntaxTree.Bind(this.Input());
        this.Print(SyntaxTree.Print(Tree));
        // const Evaluation = new Evaluator(this.Env).Evaluate(Tree);
        // const Value = JSON.stringify(Evaluation);
        // this.Print(this.Input(), Value);
      } catch (error) {
        if (error instanceof Diagnostic) {
          const Diagnostic = error as Diagnostic;
          if (Diagnostic.Code !== DiagnosticCode.EmptyProgram) this.Buffer.push("# " + this.Buffer.pop());
          this.Print(this.Input(), Diagnostic.Message);
        } else {
          console.log(error);
        }
      }
    }
  }

  private Print(Str: string = "", Message?: string) {
    console.log(Str);
    if (Message) console.log("\n" + Message);
    console.log();
    return Str + "\n";
  }

  private Input() {
    return this.Buffer.join("\n");
  }

  private LoadSource(): string {
    const FullPath = path.join(".", "src", "IO", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }
}
