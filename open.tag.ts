import Identifier from "./identifier.ts";
import Tag from "./tag.ts";
import TokenInfo from "./token.info.ts";

export default class OpenTag extends Tag {
  constructor(public name: Identifier = new Identifier("", new TokenInfo(0, 0)), public properties: string = "", public info: TokenInfo) {
    super(info);
  }
}
