import HTML from "./ast/html/HTML";
import HTMLComponent from "./ast/html/HTMLComponent";
import HTMLVoidElement from "./ast/html/HTMLVoidElement";
import OpenTag from "./ast/html/OpenTag";
import Identifier from "./ast/expressions/Identifier";
import Number from "./ast/expressions/Number";
import String from "./ast/expressions/String";
import Minus from "./ast/operators/Minus";
import Slash from "./ast/operators/Slash";
import Character from "./ast/tokens/Character";
import Colon from "./ast/tokens/Colon";
import CloseTag from "./ast/html/CloseTag";
import HTMLElement from "./ast/html/HTMLElement";
import HTMLTextContent from "./ast/html/HTMLTextContent";
import OpenScriptTag from "./ast/html/OpenScriptTag";
import CloseScriptTag from "./ast/html/CloseScriptTag";
import HTMLScript from "./ast/html/HTMLScript";
import HTMLComment from "./ast/html/HTMLComment";
import SelfClosingHTMLElement from "./ast/html/SelfClosingHTMLElement";
import Lexer from "./Lexer";
import ParserService from "./ParserService";
import LessThan from "./ast/tokens/LessThan";
import GreaterThan from "./ast/tokens/GreaterThan";
import Attribute from "./ast/html/Attribute";
import ExclamationMark from "./ast/tokens/ExclamationMark";
import Equals from "./ast/tokens/Equals";
import Parser from "./Parser";

const HTMLVoidElements = ["br", "hr", "img", "input", "link", "base", "meta", "param", "area", "embed", "col", "track", "source"];

const HTMLParser = (input: string) => {
  const { throwError, expect, doNotExpect } = ParserService();
  const { parseString } = Parser(input);
  const tokenizer = Lexer(input);
  const { getNextToken, considerSpace, ignoreSpace, peekToken, hasMoreTokens } = tokenizer;

  const parseHTMLComponent = (): HTML => {
    const left = parseHTMLTextContent();
    if (left instanceof OpenTag) {
      if (HTMLVoidElements.includes(left.tag)) {
        return new HTMLVoidElement(left.tag, left.attributes);
      }
      const children = new Array<HTMLComponent>();
      while (hasMoreTokens()) {
        const right = parseHTMLComponent();
        if (right instanceof CloseTag) {
          if (left.tag !== right.tag) {
            throwError(`\`${right.tag}\` is not a match for \`${left.tag}\` tag`);
          }
          return new HTMLElement(left.tag, left.attributes, children);
        }
        expect(right, HTMLComponent, `\`${right.type}\` is not a valid \`HTMLComponent\``);
        children.push(right);
      }
      throwError(`expecting a closing \`${left.tag}\` tag`);
    }
    return left;
  };

  const parseHTMLTextContent = (): HTML => {
    let view = "";
    considerSpace();
    if (peekToken() instanceof LessThan) {
      ignoreSpace();
      return parseHTMLScript();
    }
    while (hasMoreTokens()) {
      if (peekToken() instanceof LessThan) break;
      const char = getNextToken() as Character;
      view += char.view;
    }
    ignoreSpace();
    if (/^\s+$/.test(view)) {
      return parseHTMLTextContent();
    }
    return new HTMLTextContent(view);
  };

  const parseHTMLScript = () => {
    const left = parseTag();
    if (left instanceof OpenScriptTag) {
      let view = "";
      while (hasMoreTokens()) {
        considerSpace();
        if (peekToken() instanceof LessThan) {
          const from = tokenizer.pointer;
          try {
            const tag = parseTag();
            if (tag instanceof CloseScriptTag) {
              ignoreSpace();
              return new HTMLScript(view);
            }
          } catch {
            view += input.substring(from, tokenizer.pointer);
          }
        }
        const token = getNextToken() as Character;
        view += token.view;
      }
      throwError(`expecting a closing script tag`);
    }
    return left;
  };

  const parseTag = () => {
    const left = parseHTMLComment();
    if (left instanceof HTMLComment) return left;
    if (peekToken() instanceof Slash) {
      getNextToken();
      const identifier = expect(parseTagIdentifier(), Identifier, "expecting identifier for closing tag");
      expect(getNextToken(), GreaterThan, "expecting `>` for closing tag");
      if (identifier.view === "script") return new CloseScriptTag();
      return new CloseTag(identifier.view);
    }
    const identifier = expect(parseTagIdentifier(), Identifier, "expecting identifier for open tag");
    const attributes = new Array<Attribute>();
    while (peekToken() instanceof Identifier) {
      attributes.push(parseAttribute());
    }
    if (peekToken() instanceof Slash) {
      const token = getNextToken() as Character;
      expect(getNextToken(), GreaterThan, `expecting closing token \`>\` but matched \`${token.view}\` after tag name identifier \`${identifier.view}\``);
      return new SelfClosingHTMLElement(identifier.view, attributes);
    }
    const token = getNextToken() as Character;
    expect(token, GreaterThan, `expecting a closing \`>\` for \`${identifier.view}\` open tag but matched \`${token.view}\` character`);
    if (identifier.view === "script") return new OpenScriptTag();
    return new OpenTag(identifier.view, attributes);
  };

  const parseHTMLComment = () => {
    const left = expect(getNextToken(), LessThan, "expecting `<` for an html tag");
    if (peekToken() instanceof ExclamationMark) {
      expect(getNextToken(), ExclamationMark, "expecting `!` for a comment");
      const errorMessage = "expecting `--` after `!` for a comment";
      expect(getNextToken(), Minus, errorMessage);
      expect(getNextToken(), Minus, errorMessage);
      let view = "";
      considerSpace();
      while (hasMoreTokens()) {
        if (peekToken() instanceof Minus) {
          const keep = tokenizer.pointer;
          getNextToken();
          const token = peekToken();
          doNotExpect(token, GreaterThan, "expecting `--` before `>` for a comment");
          if (token instanceof Minus) {
            getNextToken();
            expect(getNextToken(), GreaterThan, "expecting `>` for comment");
            ignoreSpace();
            return new HTMLComment(view);
          }
          tokenizer.pointer = keep;
        }
        const char = getNextToken() as Character;
        view += char.view;
      }
      throwError("unexpected end of comment");
    }
    return left;
  };

  const parseTagIdentifier = () => {
    const left = getNextToken() as Character;
    const identifier = expect(left, Identifier, `expecting an identifier but matched \`${left.view}\` for tag name`);
    let view = identifier.view;
    considerSpace();
    while (peekToken() instanceof Identifier || peekToken() instanceof Minus || peekToken() instanceof Number) {
      const right = getNextToken() as Identifier | Minus | Number;
      if (right instanceof Minus && !(peekToken() instanceof Identifier) && !(peekToken() instanceof Number)) {
        throwError("expecting an ending number or identifier for the name tag");
      }
      view += right.view;
    }
    ignoreSpace();
    return new Identifier(view);
  };

  const parseAttribute = () => {
    let property = "";
    if (peekToken() instanceof Identifier) {
      property += (getNextToken() as Character).view;
    }
    considerSpace();
    while (peekToken() instanceof Identifier || peekToken() instanceof Minus || peekToken() instanceof Number || peekToken() instanceof Colon) {
      property += (getNextToken() as Character).view;
    }
    ignoreSpace();
    let value = "";
    if (peekToken() instanceof Equals) {
      getNextToken();
      const token = peekToken() as Character;
      value = expect(parseString(), String, `expecting a string value after \`=\` following a tag property but matched \`${token.view}\``).view;
    }
    return new Attribute(property, value);
  };

  return { parseHTMLComponent };
};

export default HTMLParser;
