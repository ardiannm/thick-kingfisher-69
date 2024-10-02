import styles from "../styles/editor.module.scss";
import { type Component, For, Accessor, Show } from "solid-js";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";

export interface DiagnosticsProps {
  bag: Accessor<Array<Diagnostic>>;
}

export const Diagnostics: Component<DiagnosticsProps> = (props: DiagnosticsProps) => {
  return (
    <Show when={props.bag().length}>
      <div class={styles.diagnostics}>
        <For each={props.bag()}>
          {(diagnostic) => (
            <div class={styles.diagnostic}>
              <div class={styles.position}>
                {diagnostic.span.line}:{diagnostic.span.offset}
              </div>
              <div class={styles.message}>{diagnostic.message}</div>
            </div> // Single JSX element
          )}
        </For>
      </div>
    </Show>
  );
};
