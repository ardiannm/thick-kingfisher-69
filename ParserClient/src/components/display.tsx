import styles from "../styles/display.module.scss";

import {
  createEffect,
  createSignal,
  For,
  Show,
  type Component,
} from "solid-js";
import { SyntaxTree } from "../../../src/CodeAnalysis/Parsing/SyntaxTree";
import { Diagnostic } from "../../../src/Diagnostics/Diagnostic";

type Input = InputEvent & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

const interpreter = SyntaxTree.Init({
  AutoDeclaration: true,
  CompactCellNames: true,
});

const code = `main () {
  1+2 
}

if true {
   println("Hello world")
}

`;

const Input: Component = () => {
  const [text, setText] = createSignal(code);
  const [diagnostics, setDiagnostics] = createSignal(new Array<Diagnostic>());
  const [value, setValue] = createSignal(0);

  createEffect(() => {});

  createEffect(() => {
    const res = interpreter.Parse(text()).Bind().Evaluate();
    setDiagnostics(res.Diagnostics.Get());
    setValue(res.Value);
  });

  const handleTextAreaInput = (e: Input) => setText(e.target.value);

  return (
    <div class={styles.input}>
      <textarea
        class={styles.textArea}
        spellcheck={false}
        oninput={handleTextAreaInput}
        value={text()}
      ></textarea>
      <Show
        when={diagnostics().length > 0}
        fallback={<div class={styles.value}>{value()}</div>}
      >
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
