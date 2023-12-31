import { BoundScope } from "../BoundScope";
import { Binder } from "../CodeAnalysis/Binder/Binder";
import { Lowerer } from "../CodeAnalysis/Lowerer/Lowerer";
import { Parser } from "../CodeAnalysis/Parser/Parser";
import { Program } from "../CodeAnalysis/Parser/Program";
import { DiagnosticBag } from "../DiagnosticBag";
import { Evaluator } from "../Evaluator";
import { SourceText } from "../SourceText";

export class SpreadsheetService {
  private diagnostics = new DiagnosticBag();
  private scope = new BoundScope(this.diagnostics);
  private lower = new Lowerer();
  private binder = new Binder();
  private evaluator = new Evaluator(this.scope);

  convertToExcelColumn(index: number): string {
    let result = "";
    while (index > 0) {
      const remainder = (index - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      index = Math.floor((index - 1) / 26);
    }
    return result;
  }

  parseName(row: number, column: number) {
    return this.convertToExcelColumn(column) + row;
  }

  parse(row: number, column: number, text: string) {
    const textCode = this.parseName(row, column) + " -> " + text;
    const parser = new Parser(SourceText.From(textCode));
    const tree = this.lower.Lower(parser.Parse());
    return tree as Program;
  }

  bind(tree: Program) {
    return this.binder.Bind(tree);
  }

  parseInput(row: number, column: number, text: string) {
    const tree = this.parse(row, column, text) as Program;
    if (tree.Diagnostics.Any()) {
      return tree.Diagnostics;
    }
    return this.bind(tree);
  }

  evaluate(row: number, column: number, text: string) {
    const boundTree = this.parseInput(row, column, text);
    if (boundTree instanceof DiagnosticBag) {
      return boundTree;
    }

    console.log(boundTree);

    const value = this.evaluator.Evaluate(boundTree);
    console.log(value);
    return;
  }
}
