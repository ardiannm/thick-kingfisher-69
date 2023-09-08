import System from "./System";

export default class SystemException extends System {
  constructor(public value: string) {
    super();
  }
}
