import { SyntaxTree } from "../syntax.tree";
import { expect, it, describe } from "vitest";

export class SyntaxTreeTest {
  private constructor() {}

  private static canParseInput(text: string, trueOrFalse: boolean) {
    describe(SyntaxTree.name, () => {
      const tree = SyntaxTree.createFrom(text);
      it("should" + (trueOrFalse ? "" : " not") + " be able to parse", () => {
        expect(tree.source.diagnostics.canParse()).toBe(trueOrFalse);
      });
    });
  }

  private static canBindInput(text: string, trueOrFalse: boolean) {
    describe(SyntaxTree.name, () => {
      const tree = SyntaxTree.createFrom(text);
      it("should" + (trueOrFalse ? "" : " not") + " be able to bind", () => {
        expect(tree.source.diagnostics.canBind()).toBe(trueOrFalse);
      });
    });
  }

  private static canEvaluateInput(text: string, trueOrFalse: boolean) {
    describe(SyntaxTree.name, () => {
      const tree = SyntaxTree.createFrom(text);
      it("should" + (trueOrFalse ? "" : " not") + " be able to bind", () => {
        expect(tree.source.diagnostics.canEvaluate()).toBe(trueOrFalse);
      });
    });
  }

  static canPassStages(text: string, parsing: boolean, binding: boolean, evaluation: boolean) {
    SyntaxTreeTest.canParseInput(text, parsing);
    SyntaxTreeTest.canBindInput(text, binding);
    SyntaxTreeTest.canEvaluateInput(text, evaluation);
  }
}

SyntaxTreeTest.canPassStages("A1 :: A1", true, true, false);

SyntaxTreeTest.canPassStages(
  `A1 :: A4
A5 :: A4
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+A5
A3 :: 1
`,
  true,
  true,
  false
);
