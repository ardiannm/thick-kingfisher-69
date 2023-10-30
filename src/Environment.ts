import ParserService from "./ParserService";
import Reference from "./ast/expressions/Reference";

function Environment() {
  const { throwError } = ParserService();

  const vars = new Map<string, Reference>();
  let observing = new Array<string>();

  function clear() {
    observing = new Array<string>();
  }

  function register(ref: string) {
    if (!observing.includes(ref)) observing.push(ref);
  }

  function setVar(ref: string, token: Reference) {
    for (const o of observing) {
      if (!vars.has(o)) throwError(`Environment: reference \`${o}\` is not defined`);
      const observers = vars.get(o).observers;
      if (!observers.includes(token.name)) observers.push(token.name);
    }
    token.observing.forEach((r) => (vars.get(r).observers = vars.get(r).observers.filter((ref) => ref !== r)));
    vars.set(ref, token);
    return token;
  }

  function observers(ref: string) {
    if (vars.has(ref)) return vars.get(ref).observers;
    return new Array<string>();
  }

  function remove(ref: string) {
    if (vars.has(ref)) {
      const o = observers(ref);
      console.log(0);
    }
  }

  return { observers, clear, setVar, register, observing, vars, remove };
}

export default Environment;
