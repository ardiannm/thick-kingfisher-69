import styles from "../styles/screen.module.scss";

import { SyntaxTree } from "../../../src/analysis/parser/syntax.tree";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { DiagnosticSeverity } from "../../../src/analysis/diagnostics/diagnostic.severity";
import { CompilerOptions } from "../../../src/compiler.options";

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
A2 :: A1+2
A3 :: A1+A2+3

A1 :: 8

A3`;

const Input: Component = () => {
  const [text, setText] = createSignal(code);
  const [diagnostics, setDiagnostics] = createSignal(new Array<Diagnostic>());
  const [value, setValue] = createSignal(0);

  createEffect(() => {
    const interpreter = SyntaxTree.Init(new CompilerOptions(true, true, true));
    const response = interpreter.Parse(text()).Bind().Evaluate();
    setDiagnostics(response.diagnostics.Get());
    setValue(response.value);
  });

  const handleTextAreaInput = (e: Input) => setText(e.target.value);

  const hasErrors = (a: Diagnostic) => a.severity === DiagnosticSeverity.Error;

  return (
    <div class={styles.input}>
      <textarea class={styles.textArea} spellcheck={false} oninput={handleTextAreaInput} value={text()} autofocus={true}></textarea>
      <Show when={diagnostics().find(hasErrors)} fallback={<div class={styles.value}>{value()}</div>}>
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
