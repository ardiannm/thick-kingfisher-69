import Content from "./content.ts";
import OpenTag from "./open.tag.ts";
import Tag from "./tag.ts";
import TokenInfo from "./token.info.ts";

export default class Component extends Tag {
  constructor(public tag: OpenTag, public content: Array<Content>, public info: TokenInfo) {
    super(info);
  }
}
