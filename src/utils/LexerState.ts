import Location from "./Location";

export default class LexerState {
  constructor(public pointer: number, public tokenId: number, public location: Location = new Location(1, 1)) {}
}
