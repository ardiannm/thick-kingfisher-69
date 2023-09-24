import System from "./system/System";

export default class Environment {
  public refs = new Map<string, System>();

  public assignVar(varName: string, varValue: System) {
    this.refs.set(varName, varValue);
    return varValue;
  }

  public getVar(varName: string) {
    if (this.refs.has(varName)) return this.refs.get(varName);
    throw `\`${varName}\` is not defined`;
  }
}
