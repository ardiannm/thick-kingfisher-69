import { Parser } from "./parser.ts";
import { Primitive } from "./primitive.ts";
import { TokenGraph } from "./token.graph.ts";
import { Token } from "./token.ts";

import { loggerLog } from "./logger.ts";
import { format } from "./format.ts";

export class Highlighter extends Parser {
  constructor(public override input: string) {
    super(input);
  }

  generate() {
    const tree = this.do(this.parseAddition());
    loggerLog(tree);
  }

  private do(obj: Token, origin = "", prop = ""): TokenGraph {
    if (obj instanceof Primitive) return new TokenGraph(format(`${origin} ${prop} ${obj.token}`), obj.value);
    const subTokens = Object.entries(obj).filter(([_prop, o]) => o instanceof Token);
    return new TokenGraph(
      format(obj.token),
      subTokens.map(([_prop, o]) => this.do(o, obj.token, _prop))
    );
  }
}
