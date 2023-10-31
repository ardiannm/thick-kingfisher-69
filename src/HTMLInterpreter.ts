import System from "./system/System";
import SystemException from "./system/SystemException";
import SyntaxToken from "./ast/tokens/SyntaxToken";
import SystemString from "./system/SystemString";
import String from "./ast/expressions/String";
import HTMLTextContent from "./ast/html/HTMLTextContent";
import HTMLElement from "./ast/html/HTMLElement";
import HTMLScript from "./ast/html/HTMLScript";
import HTMLComment from "./ast/html/HTMLComment";
import SystemStringArray from "./system/SystemStringArray";
import HTMLVoidElement from "./ast/html/HTMLVoidElement";
import HTMLProgram from "./ast/html/HTMLProgram";
import SystemHTMLProgram from "./system/SystemHTMLProgram";

const HTMLInterpreter = () => {
  function evaluate<T extends SyntaxToken>(token: T): System {
    if (token instanceof HTMLProgram) return evaluateHTMLProgram(token);
    if (token instanceof String) return evaluateString(token);
    if (token instanceof HTMLElement) return evaluateHTMLElement(token);
    if (token instanceof HTMLVoidElement) return evaluateVoidHTMLElement(token);
    if (token instanceof HTMLTextContent) return evaluateHTMLTextContent(token);
    if (token instanceof HTMLScript) return evaluateHTMLScript(token);
    if (token instanceof HTMLComment) return evaluateHTMLComment(token);
    throw new SystemException(`token type \`${token.type}\` has not been implemented for interpretation`);
  }

  function evaluateHTMLProgram(token: HTMLProgram) {
    const arr = new SystemStringArray([]);
    for (const e of token.expressions) arr.value.push(evaluate(e) as SystemString);
    return new SystemHTMLProgram(arr);
  }

  function evaluateString(token: String) {
    return new SystemString(token.view);
  }

  function evaluateHTMLTextContent(token: HTMLTextContent) {
    return new SystemString(token.view);
  }

  function evaluateHTMLScript(token: HTMLScript) {
    return new SystemString(token.view);
  }

  function evaluateHTMLComment(token: HTMLComment) {
    return new SystemString(token.view);
  }

  function evaluateVoidHTMLElement(_: HTMLVoidElement) {
    return new SystemString("");
  }

  function evaluateHTMLElement(token: HTMLElement) {
    return new SystemStringArray(token.children.map((e) => evaluate(e) as SystemString));
  }

  return { evaluate };
};

export default HTMLInterpreter;
