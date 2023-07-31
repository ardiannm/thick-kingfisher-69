import { Token } from "./token.ts";

const Stringify = (token: Token) => JSON.stringify(token, null, 3);
export default Stringify;
