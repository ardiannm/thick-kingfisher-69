import { question as Prompt } from "readline-sync";
import { Parser } from "./src/Parser";
import { Diagnostics } from "./src/CodeAnalysis/Diagnostics/Diagnostics";
import { Diagnostic } from "./src/CodeAnalysis/Diagnostics/Diagnostic";
import { Binder } from "./src/CodeAnalysis/Binding/Binder";

const Logger = new Diagnostics();

var ShowTree = false;

while (true) {
  const Input = Prompt("> ");
  const Syntax = new Parser(Input, Logger);
  const Tree = Syntax.Parse();
  const BoundTree = new Binder(Logger);

  if (Input.trim() === "tree") {
    ShowTree = !ShowTree;
    Logger.Log();
    continue;
  }

  if (ShowTree) Logger.Log(Tree);

  if (Logger.Any()) {
    Logger.Show();
  } else {
    try {
      Logger.Log(BoundTree.Bind(Tree));
    } catch (error) {
      Logger.Log((error as Diagnostic).Message);
    }
  }
  Logger.Clear();
}
