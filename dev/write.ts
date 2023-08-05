import LogError from "../log.error.ts";

export const write = (token: Array<LogError>) => {
  Deno.writeTextFile("./dev/log.json", JSON.stringify(token, null, 3));
};
