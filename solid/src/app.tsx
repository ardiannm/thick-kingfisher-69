import styles from "./app.module.scss";

import BoudScopeComponent from "./components/bound.scope";

import { type Component, createSignal, createEffect } from "solid-js";

import { BezierCurve, Position } from "./components/bezier.curve";
import { CodeEditor } from "./components/code.editor";
import { Diagnostic } from "../../src/analysis/diagnostics/diagnostic";
import { SyntaxTree } from "../../src/runtime/syntax.tree";
import { BoundScope } from "../../src/analysis/binder/bound.scope";

var defaultCode = `A1 :: A2+A3`;

const App: Component = () => {
  const start = createSignal<Position>({ x: 637, y: 643 });
  const end = createSignal<Position>({ x: 950, y: 470 });
  const textCode = createSignal<string>(defaultCode);
  const scopePosition = createSignal<Position>({ x: 1035, y: 450 });

  const [diagnostics, setDiagnostics] = createSignal<Array<Diagnostic>>([]);
  const [scope, setScope] = createSignal<BoundScope>(SyntaxTree.createFrom().boundRoot.scope);

  createEffect(() => {
    const tree = SyntaxTree.createFrom(textCode[0]());
    setDiagnostics(tree.diagnostics.getDiagnostics());
    setScope(tree.boundRoot.scope);
  });

  return (
    <div class={styles.app}>
      <CodeEditor code={textCode} diagnostics={diagnostics} />
      <BoudScopeComponent position={scopePosition} scope={scope}></BoudScopeComponent>
      <BezierCurve startPosition={start} endPosition={end} dots />
    </div>
  );
};

export default App;
