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
    this.Buffer = this.Report(this.LoadSource(), "Interpreter: Source text content from file.").trim().split("\n");
    for (const Line of this.Buffer) {
      this.Width = Math.max(this.Width, Line.length);
    }
  }

  private LoadSource(): string {
    const FullPath = path.normalize(path.join(".", "src", "IO", ".lang"));
    return fs.readFileSync(FullPath, "utf8");
  }

  private Report(Str: string = "", Message?: string) {
    console.log();
    console.log(Str);
    if (Message) {
      console.log("-".repeat(Math.max(Message.length, this.Width)));
      console.log(Message);
    }
    console.log();
    return Str;
  }

  private Input() {
    return this.Buffer.join("\n");
  }

  Run() {
    while (true) {
      const InputLine = Promp.question("> ");
      console.clear();
      // Provide a way to exit the loop
      if (InputLine.toLowerCase() === "exit") {
        break;
      }
      // Clear the last line
      if (InputLine.toLowerCase() === "cls") {
        console.clear();
        this.Buffer.pop();
        const Message = this.Buffer.length > 0 ? "Interpreter: Line " + (this.Buffer.length + 1) + " removed." : "";
        this.Report(this.Input(), Message);
        continue;
      }
      if (InputLine.trim()) {
        // Concatenate the input to the buffer
        this.Buffer.push(InputLine);
      }
      try {
        const Tree = SyntaxTree.Bind(this.Input(), this.Environment);
        const Evaluation = new Evaluator(this.Environment).Evaluate(Tree);
        const Value = JSON.stringify(Evaluation);
        this.Report(this.Input(), Value);
      } catch (error) {
        this.Report(this.Input(), (error as Diagnostic).Message);
      }
    }
  }
}
