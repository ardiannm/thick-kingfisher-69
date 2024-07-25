import styles from "../styles/screen.module.scss";

import { SyntaxTree } from "../../../src/analysis/parser/syntax.tree";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";

type Input = InputEvent & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

var code = `A1 :: A2
A3 :: A4+A5`;

const Input: Component = () => {
  const [text, setText] = createSignal(code);
  const [diagnostics, setDiagnostics] = createSignal(new Array<Diagnostic>());
  const [value, setValue] = createSignal(0);
  const [doEval, setDoEval] = createSignal(false);

  createEffect(() => {
    const tree = SyntaxTree.createFrom(text());
    const value = tree.evaluate();
    setDiagnostics(tree.diagnosticsBag.getDiagnostics());
    setValue(value as number);
    setDoEval(tree.diagnosticsBag.canEvaluate());
  });

  const handleTextAreaInput = (e: Input) => setText(e.target.value);

  return (
    <div class={styles.input}>
      <textarea class={styles.textArea} spellcheck={false} oninput={handleTextAreaInput} value={text()} autofocus={true}></textarea>
      <Show when={diagnostics().length || doEval()}>
        <div class={styles.diagnostics}>
          <Show when={doEval()}>{<div class={styles.value}>{value()}</div>} </Show>
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
