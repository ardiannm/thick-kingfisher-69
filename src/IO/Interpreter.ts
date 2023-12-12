import * as fs from "fs";
import * as path from "path";

import { Diagnostic } from "../CodeAnalysis/Diagnostics/Diagnostic";
import { SyntaxTree } from "../CodeAnalysis/Syntax/SyntaxTree";
import { Environment } from "../Environment";
import { Evaluator } from "../Evaluator";

import Promp from "readline-sync";

export class Interpreter {
  private Environment = new Environment();
  private Buffer = new Array<string>();
  private Width = 0;

  constructor() {
    console.clear();
  }

  Run() {
    while (true) {
      const InputLine = Promp.question("> ");
      this.Width = Math.max(this.Width, InputLine.length);

      console.clear();

      if (InputLine.toLowerCase() === "exit") {
        break;
      }

      if (InputLine.toLowerCase() === "cls") {
        console.clear();
        this.Buffer.pop();
        const Message = this.Buffer.length > 0 ? "Interpreter: Line " + (this.Buffer.length + 1) + " removed." : "";
        this.Report(this.Input(), Message);
        continue;
      }

      if (InputLine.trim()) {
        this.Buffer.push(InputLine);
      }

      try {
        const Tree = SyntaxTree.Bind(this.Input(), this.Environment);
        const Evaluation = new Evaluator(this.Environment).Evaluate(Tree);
        const Value = JSON.stringify(Evaluation);
        this.Report(this.Input(), Value);
      } catch (error) {
        this.Buffer.push("# " + this.Buffer.pop());
        this.Report(this.Input(), (error as Diagnostic).Message);
      }
    }
  }

  private Report(Str: string = "", Message?: string) {
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
