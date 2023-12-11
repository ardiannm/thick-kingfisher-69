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
    this.InitializeBuffer();
  }

  // Main method to run the interpreter loop
  Run() {
    while (true) {
      const InputLine = Promp.question("> ");
      console.clear();

      // Provide a way to exit the loop
      if (InputLine.toLowerCase() === "exit") {
        break;
      }

      // Provide a way to reset the interpreter state
      if (InputLine.toLowerCase() === "reset") {
        this.InitializeBuffer();
        continue;
      }

      // Clear the last line in the buffer and console
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
        // Parse and evaluate the input syntax tree
        const Tree = SyntaxTree.Bind(this.Input(), this.Environment);
        const Evaluation = new Evaluator(this.Environment).Evaluate(Tree);
        const Value = JSON.stringify(Evaluation);
        this.Report(this.Input(), Value);
      } catch (error) {
        // Report any errors that occur during parsing or evaluation
        this.Report(this.Input(), (error as Diagnostic).Message);
      }
    }
  }

  // Initialize the interpreter by loading source text from a file
  private InitializeBuffer() {
    console.clear();
    this.Buffer = this.Report(this.LoadSource()).split("\n");
    for (const Line of this.Buffer) {
      this.Width = Math.max(this.Width, Line.length);
    }
  }

  // Load source text content from a file
  private LoadSource(): string {
    const FullPath = path.join(".", "src", "IO", ".lang");
    return fs.readFileSync(FullPath, "utf8");
  }

  // Display a formatted message in the console
  private Report(Str: string = "", Message?: string) {
    console.log();
    console.log(Str);
    if (Message) {
      // const Seperator = "-".repeat(Math.max(Message.length, this.Width));
      console.log(/* Seperator */);
      console.log(Message);
    }
    console.log();
    return Str;
  }

  // Combine the lines in the buffer into a single input string
  private Input() {
    return this.Buffer.join("\n");
  }
}
