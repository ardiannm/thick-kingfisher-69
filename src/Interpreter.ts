import { Binder } from "./CodeAnalysis/Binder/Binder";
import { BoundProgram } from "./CodeAnalysis/Binder/BoundProgram";
import { Parser } from "./CodeAnalysis/Parser/Parser";
import { Program } from "./CodeAnalysis/Parser/Program";
import { EvaluatedProgram } from "./EvaluatedProgram";
import { Evaluator } from "./Evaluator";
import { SourceText } from "./Text/SourceText";

import * as fs from "fs";

export class Interpreter {
  private binder = new Binder();
  private evaluator = new Evaluator();

  private GetLetter(column: number): string {
    let name = "";
    while (column > 0) {
      const remainder = (column - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      column = Math.floor((column - 1) / 26);
    }
    return name;
  }

  Parse(text: string): Program {
    const parser = new Parser(SourceText.From(text));
    return parser.Parse();
  }

  Bind(text: string): BoundProgram {
    return this.binder.Bind(this.Parse(text)) as BoundProgram;
  }

  Evaluate(text: string): EvaluatedProgram {
    return this.evaluator.Evaluate(this.Bind(text));
  }

  ParseName(row: number, column: number) {
    return this.GetLetter(column) + row;
  }

  GetCell(Name: string) {
    return this.binder.Scope.GetCell(Name);
  }

  ReadFile(filePath: string): string {
    try {
      // Use 'fs.readFileSync' to read the file synchronously
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      // Handle any errors that might occur during file reading
      console.error("Error reading the file:", error);
      return "";
    }
  }
}
