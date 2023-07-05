export class Token {
  public class = this.constructor.name;
  public repr: string;
  public starts: number;
  public ends: number;
  constructor(repr: string, starts: number, ends: number) {
    this.repr = repr;
    this.starts = starts;
    this.ends = ends;
  }
}
