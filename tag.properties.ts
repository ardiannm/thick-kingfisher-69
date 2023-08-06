import Tag from "./tag.ts";
import TokenInfo from "./token.info.ts";

export default class TagProperties extends Tag {
  constructor(public raw: string, public info: TokenInfo) {
    super(info);
  }
}
