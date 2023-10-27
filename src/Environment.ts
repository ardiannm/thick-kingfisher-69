import System from "./system/System";

export default class Environment {
  public vars = new Map<string, System>();
  public graph = new Map<string, Set<string>>();

  public assignVar(varName: string, varValue: System) {
    // if(this.vars.has(varName))
    this.vars.set(varName, varValue);
    return varValue;
  }

  public getVar(varName: string) {
    if (this.vars.has(varName)) return this.vars.get(varName);
    throw `Environment: \`${varName}\` is not defined`;
  }
}
