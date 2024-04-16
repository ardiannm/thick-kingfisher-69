import styles from "../styles/screen.module.scss";

import { SyntaxTree } from "../../../src/analysis/parser/syntax.tree";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";

type Input = InputEvent & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

const code = `if true {
   println("Hello world")
}

`;

const Input: Component = () => {
  const [text, setText] = createSignal(code);
  const [diagnostics, setDiagnostics] = createSignal(new Array<Diagnostic>());
  const [value, setValue] = createSignal(0);

  createEffect(() => {
    const interpreter = SyntaxTree.Init({ AutoDeclaration: true, CompactCellNames: true });
    const response = interpreter.Parse(text()).Bind().Evaluate();
    setDiagnostics(response.Diagnostics.Get());
    setValue(response.Value);
  });

  const handleTextAreaInput = (e: Input) => setText(e.target.value);

  return (
    <div class={styles.input}>
      <textarea class={styles.textArea} spellcheck={false} oninput={handleTextAreaInput} value={text()}></textarea>
      <Show when={diagnostics().length > 0} fallback={<div class={styles.value}>{value()}</div>}>
        <div class={styles.diagnostics}>
          <For each={diagnostics()}>
            {(diagnostic) => {
              return <div class={styles.diagnostic}>{diagnostic.Message}</div>;
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default Input;
