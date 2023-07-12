export class Highlight {
  constructor(public token: string, public subTokens: Array<Highlight> | string) {}
}
