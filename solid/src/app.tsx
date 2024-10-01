import styles from "./app.module.scss";

import Graph from "./components/boud.scope";

import { type Component, createSignal, createEffect, Show } from "solid-js";

import { BezierCurve, Position } from "./components/bezier.curve";
import { CodeEditor } from "./components/code.editor";
import { Diagnostic } from "../../src/analysis/diagnostics/diagnostic";
import { SyntaxTree } from "../../src/runtime/syntax.tree";
import { CompilerOptions } from "../../src/compiler.options";
import { BoundScope } from "../../src/analysis/binder/bound.scope";
import Draggable from "./components/draggable";

var defaultCode = `A1 :: A6
A2 :: A1
A3 :: A1+A2+A4+A5
A6 :: A1+A2+A5


''' just show which reference is causing circular dependency that's all that matters '''`;

const App: Component = () => {
  const start = createSignal<Position>({ x: 183, y: 618 });
  const end = createSignal<Position>({ x: 367, y: 275 });
  const textCode = createSignal<string>(defaultCode);
  const scopePosition = createSignal<Position>({ x: 1035, y: 450 });

  const [diagnostics, setDiagnostics] = createSignal<Array<Diagnostic>>([]);
  const [scope, setScope] = createSignal<BoundScope>();

  createEffect(() => {
    const tree = SyntaxTree.createFrom(textCode[0](), new CompilerOptions(true));
    tree.evaluate();
    setDiagnostics(tree.diagnostics.getDiagnostics());
    setScope(tree.boundRoot?.scope);
  });

  return (
    <div class={styles.app}>
      <Show when={scope()}>
        <Draggable position={scopePosition}>{scope() && new Graph(scope()!).render()}</Draggable>
      </Show>
      <CodeEditor code={textCode} diagnostics={diagnostics} />
      <BezierCurve startPosition={start} endPosition={end} dots />
    </div>
  );
};

export default App;
