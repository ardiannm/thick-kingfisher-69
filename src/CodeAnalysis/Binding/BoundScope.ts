import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";

export class BoundScope {
  Dependencies = new Map<string, Set<string>>();
  Names = new Set<string>();
  Diagnostics: DiagnosticBag = new DiagnosticBag();

  public RegisterDependencies(Name: string, Dependencies: Set<string>) {
    if (Dependencies.has(Name)) throw this.Diagnostics.UsedBeforeItsDeclaration(Name);
    this.Check(Name, Dependencies);
    this.Dependencies.set(Name, new Set(Dependencies));
  }

  public ReferToThis(Name: string) {
    this.Names.add(Name);
  }

  public CearNames() {
    this.Names.clear();
  }

  private Check(Name: string, Dependencies: Set<string>) {
    for (const Dep of Dependencies) {
      if (!this.Dependencies.has(Dep)) throw this.Diagnostics.CantFindName(Dep);
      const Deps = this.Dependencies.get(Dep) as Set<string>;
      if (Deps.has(Name)) throw this.Diagnostics.CircularDependency(Dep);
      this.Check(Name, Deps);
    }
  }
}
