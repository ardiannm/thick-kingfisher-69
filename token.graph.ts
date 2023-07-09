export class TokenGraph {
  constructor(public token: string, public subTokens: Array<TokenGraph> | string) {}
}
