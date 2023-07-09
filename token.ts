import { format } from "./format.ts";

export class Token {
  public token = format(this.constructor.name);
}
