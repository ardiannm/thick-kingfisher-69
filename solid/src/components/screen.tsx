import styles from "../styles/screen.module.scss";

import { SyntaxTree } from "../../../src/runtime/syntax.tree";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";

type Input = InputEvent & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

var code = `A1 :: 2
A2 :: A1+3
A3 :: A1+A2
A4 :: A2+A3
A1 :: 0`;

var code = `A1 :: 1
A2 :: A1
A3 :: A1
A4 :: A2+A3`;

const Input: Component = () => {
  const [text, setText] = createSignal(code);
  const [diagnostics, setDiagnostics] = createSignal<Array<Diagnostic>>(new Array());
  const [value, setValue] = createSignal(0);
  const [doEval, setDoEval] = createSignal(false);

  createEffect(() => {
    const tree = SyntaxTree.createFrom(text());
    const value = tree.evaluate();
    const d = tree.diagnostics.getDiagnostics();
    setDiagnostics(d);
    setValue(value as number);
    setDoEval(tree.diagnostics.canEvaluate());
  });

  const handleTextAreaInput = (e: Input) => setText(e.target.value);

  return (
    <div class={styles.input}>
      <div class={styles.curve}></div>
      <div class={styles.buttonTop}></div>
      <div class={styles.buttonBottom}></div>
      <textarea class={styles.textArea} spellcheck={false} oninput={handleTextAreaInput} value={text()} autofocus={true}></textarea>
      <Show when={diagnostics().length || doEval()}>
        <div class={styles.diagnostics}>
          <Show when={doEval()}>{<div class={styles.value}>{value()}</div>} </Show>
          <div class={styles.diagnosticsContainer}>
            <For each={diagnostics()}>
              {(d) => (
                <div class={styles.diagnostic}>
                  <span class={styles.diagnosticsLocation}>
                    {d.span.line}:{d.span.offset}
                  </span>
                  <span class={styles.diagnosticMessage}> {d.message}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Input;
