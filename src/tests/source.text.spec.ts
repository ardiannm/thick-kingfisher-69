import { describe, expect, it } from "vitest";
import { SourceText } from "../lexing/source.text";

export class SourceTextTest {
  private constructor() {}

  static run(text: string) {
    describe(SourceText.name, () => {
      const tree = SourceText.createFrom(text);
      const lines = tree.getLines();
      it("reconstructed text from line spans should match the original input.", () => {
        const generatedText = tree
          .getLines()
          .map((ln) => ln.fullSpan.text)
          .join("");
        expect(generatedText).toBe(text);
      });
      it("no line span should contain newline characters within its text.", () => {
        let count = 0;
        lines.forEach((ln) => ln.span.text.includes("\n") && count++);
        expect(count).toBe(0);
      });
      it("every line's `end` should match the next line's `start`.", () => {
        let correct = true;
        let i = 0;
        while (i < lines.length - 1) {
          const span = lines[i].fullSpan;
          const nextSpan = lines[i + 1].fullSpan;
          if (span.end !== nextSpan.start) {
            correct = false;
            break;
          }
          i++;
        }
        expect(correct).toBe(true);
      });
      it("each line's `end` should be greater than or equal to its `start`.", () => {
        let i = 0;
        let correct = true;
        while (i < lines.length) {
          const line = lines[i];
          if (line.span.start > line.span.end) {
            correct = false;
            break;
          }
          i++;
        }
        expect(correct).toBe(true);
      });
      it("should return the position of the last character when column exceeds text length.", () => {
        const position = tree.getPosition(lines.length, lines[lines.length - 1].span.column + 10000000);
        expect(position).toBe(text.length);
      });
      it("should return position 0 for out-of-bounds negative line numbers.", () => {
        expect(tree.getPosition(-1000, 457)).toBe(0);
      });
    });
  }
}

SourceTextTest.run(`A1 :: A4
  A5 :: A4
  A2 :: A1+3
  A3 :: A2+5
  A4 :: A3+A2+A5
  A3 :: 1
`);
