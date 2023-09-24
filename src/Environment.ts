import System from "./system/System";

export default class Environment {
  private vars = new Map<string, System>();

  public assignVar<S extends System>(varName: string, varValue: S) {
    this.vars.set(varName, varValue);
    return varValue;
  }

  //   public declareVar<S extends System>(varName: string, varValue: S) {}
}
