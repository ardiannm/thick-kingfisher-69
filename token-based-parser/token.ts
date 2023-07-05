export class Metadata {
  constructor(public starts: number, public ends: number) {}
}

export class Token {
  public class = this.constructor.name;
  public repr: string;
  public metadata: Metadata;
  constructor(repr: string, ends: number) {
    this.repr = repr;
    this.metadata = new Metadata(ends - this.repr.length, ends);
  }
}
