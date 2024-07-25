import styles from "../styles/screen.module.scss";

import { SyntaxTree } from "../../../src/analysis/parser/syntax.tree";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";

type Input = InputEvent & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

var code = `if true {
   println("Hello world")
}

`;

var code = `#

first() {
    second() {}
}

third() {}

#
`;

var code = `A1 :: 1
B2 :: A1+2
C3 :: A1+B2+3

A1 :: 8

C3`;

var code = `A1 :: A2+3

# console should still print the value despite the warning`;

const Input: Component = () => {
  const [text, setText] = createSignal(code);
  const [diagnostics, setDiagnostics] = createSignal(new Array<Diagnostic>());
  const [value, setValue] = createSignal(0);

  createEffect(() => {
    const program = SyntaxTree.createFrom(text());
    const response = program.evaluate();
    setDiagnostics(program.diagnosticsBag.getDiagnostics());
    setValue(response as number);
  });

  const handleTextAreaInput = (e: Input) => setText(e.target.value);

  return (
    <div class={styles.input}>
      <textarea class={styles.textArea} spellcheck={false} oninput={handleTextAreaInput} value={text()} autofocus={true}></textarea>
      <Show when={diagnostics().length} fallback={<div class={styles.value}>{value()}</div>}>
        <div class={styles.diagnostics}>
          <div class={styles.diagnosticsWrapper}>
            <For each={diagnostics()}>
              {(diagnostic) => {
                return <div class={styles.diagnostic}>{diagnostic.message}</div>;
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Input;
