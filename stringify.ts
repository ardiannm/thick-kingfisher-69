import { Token } from "./token.ts";

export const stringify = (token: Token) => JSON.stringify(token, null, 3);
