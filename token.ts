export class Metadata {
  constructor(public starts: number, public ends: number) {}
}

export class Token {
  public class = this.constructor.name;
  public font: string;
  public metadata: Metadata;
  constructor(font: string, ends: number) {
    this.font = font;
    this.metadata = new Metadata(ends - this.font.length, ends);
  }
}

