import SystemNumber from "./system/SystemNumber";
export default class Environment {
  public vars = new Map<string, SystemNumber>();

  public assignVar(varName: string, varValue: SystemNumber) {
    // if(this.vars.has(varName))
    this.vars.set(varName, varValue);
    return varValue;
  }

  public getVar(varName: string) {
    if (this.vars.has(varName)) return this.vars.get(varName);
    throw `\`${varName}\` is not defined`;
  }
}
