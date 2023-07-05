export abstract class Node {
  public type = this.constructor.name.replace(/Node$/, "");
}
