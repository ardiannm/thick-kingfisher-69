import System from "./system/System";
import SystemObservable from "./system/SystemObservable";
export default class Environment {
  public vars = new Map<string, SystemObservable>();

  public assignVar(varName: string, textFormula: string, varValue: System) {
    const observable = new SystemObservable(varValue, textFormula, []);
    // if(this.vars.has(varName))
    this.vars.set(varName, observable);
    return observable;
  }

  public getVar(varName: string) {
    if (this.vars.has(varName)) return this.vars.get(varName);
    throw `\`${varName}\` is not defined`;
  }

  public registerObserver(ref: string, observer: string) {
    const refs = this.getVar(ref).refs;
    if (!refs.includes(observer)) refs.push(observer);
  }
}
