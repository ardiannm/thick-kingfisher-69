import { Parser } from "./analysis/parsing/parser";
import { SyntaxCompilationUnit } from "./analysis/parsing/syntax.compilation.unit";
import { SourceText } from "./lexing/source.text";

export class CompilerOptions {
  constructor(public explicitDeclarations: boolean) {}
}

export class SyntaxTree {
  syntaxRoot: SyntaxCompilationUnit;

  private constructor(public sourceText: SourceText, public configuration: CompilerOptions) {
    this.syntaxRoot = Parser.parseCompilationUnit(sourceText);
  }

  static createFrom(text: string | SourceText = "", configuration: CompilerOptions = new CompilerOptions(true)) {
    const sourceText = text instanceof SourceText ? text : SourceText.createFrom(text);
    return new SyntaxTree(sourceText, configuration);
  }
}
