import styles from "../styles/editor.module.scss";
import { type Component, For, Accessor } from "solid-js";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";

export interface DiagnosticsProps {
  bag: Accessor<Array<Diagnostic>>;
}

export const Diagnostics: Component<DiagnosticsProps> = (props: DiagnosticsProps) => {
  return (
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
  );
};
