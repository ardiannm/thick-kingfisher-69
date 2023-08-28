import Location from "./Location";

export default class Logger {
  constructor(public from: Location, public to: Location) {}

  public log(source: string, errorMessage: string) {
    console.log(this);
  }
}
