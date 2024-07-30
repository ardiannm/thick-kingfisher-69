import styles from "../styles/screen.module.scss";

import { SyntaxTree } from "../../../src/runtime/syntax.tree";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";

type Input = InputEvent & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

var code = `# circular dependency in cell assignments

A1 :: B3
B3 :: A1+D7+A1
E :: 1+F`;

var code = `# circular dependency in cell assignments

{
   A1 :: B3
   B3 :: A1+D7+A1
   {
       A1 :: B3
    }
}

A1`;

var code = ``;

const Input: Component = () => {
  const [text, setText] = createSignal(code);
  const [diagnostics, setDiagnostics] = createSignal(new Array<Diagnostic>());
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
      <textarea class={styles.textArea} spellcheck={false} oninput={handleTextAreaInput} value={text()} autofocus={true}></textarea>
      <Show when={diagnostics().length || doEval()}>
        <div class={styles.diagnostics}>
          <Show when={doEval()}>{<div class={styles.value}>{value()}</div>} </Show>
          <div class={styles.diagnosticsContainer}>
            <For each={diagnostics()}>
              {(d) => (
                <div class={styles.diagnostic}>
                  <span class={styles.diagnosticsLocation}>
                    {d.line}:{d.offset}
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
