import Token from "./Token";

export default class Exception extends Token {
  constructor(public gen: number, public message: string) {
    super(gen);
  }
}
