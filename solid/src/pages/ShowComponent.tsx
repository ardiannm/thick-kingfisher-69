import BoudScopeComponent from "../components/bound.scope";
import MenuBarComponent from "./MenuBarComponent";

import { type Component, createSignal, createEffect } from "solid-js";

import { BezierCurve, Position } from "../components/bezier.curve";
import { BoundScope } from "../../../src/analysis/binder/bound.scope";
import { Diagnostic } from "../../../src/analysis/diagnostics/diagnostic";
import { CodeEditor } from "../components/code.editor";
import { SyntaxTree } from "../../../src/syntax.tree";
import { SourceText } from "../../../src/lexing/source.text";

var defaultCode = `A1 :: A2+A3`;

const ShowComponent: Component = () => {
  const start = createSignal<Position>({ x: 637, y: 643 });
  const end = createSignal<Position>({ x: 950, y: 470 });
  const textCode = createSignal<string>(defaultCode);
  const scopePosition = createSignal<Position>({ x: 1035, y: 450 });

  const [diagnostics, setDiagnostics] = createSignal<Array<Diagnostic>>([]);
  const [scope, setScope] = createSignal<BoundScope>(SyntaxTree.createFrom().bound.scope);

  createEffect(() => {
    const text = textCode[0]();
    const sourceText = SourceText.createFrom(text);
    const tree = SyntaxTree.createFrom(sourceText);
    setDiagnostics(sourceText.diagnostics.getDiagnostics());
    setScope(tree.bound.scope);
  });

  return (
    <MenuBarComponent>
      <CodeEditor code={textCode} diagnostics={diagnostics} />
      <BoudScopeComponent position={scopePosition} scope={scope}></BoudScopeComponent>
      <BezierCurve startPosition={start} endPosition={end} dots />
    </MenuBarComponent>
  );
};

export default ShowComponent;
