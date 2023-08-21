import Token from "./Token";

export default class Exception extends Token {
  constructor(public id: number, public message: string) {
    super(id);
  }
}
