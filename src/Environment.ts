import SystemCell from "./system/SystemCell";

export default class Environment {
  public vars = new Map<string, SystemCell>();

  public assignVar(varName: string, varValue: SystemCell) {
    // if(this.vars.has(varName))
    this.vars.set(varName, varValue);
    return varValue;
  }

  public getVar(varName: string) {
    if (this.vars.has(varName)) return this.vars.get(varName);
    throw `Environment: \`${varName}\` is not defined`;
  }
}
