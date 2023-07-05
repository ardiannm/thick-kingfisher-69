export class Token {
  public class = this.constructor.name;
  public repr: string;
  public startsAt: number;
  public endsAt: number;
  constructor(repr: string, startsAt: number, endsAt: number) {
    this.repr = repr;
    this.startsAt = startsAt;
    this.endsAt = endsAt;
  }
}
