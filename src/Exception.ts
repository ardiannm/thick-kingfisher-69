import Token from "./Token";

export default class Exception extends Token {
  constructor(public message: string) {
    super();
  }
}
