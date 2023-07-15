// import { Parser } from "https://deno.land/x/amparser@v0.0.3/mod.ts";
import { Parser } from "./mod.ts";

while (true) {
  console.log();
  const input = prompt(">>") || "";
  const token = new Parser(input).parse().toString();
  console.log(token);
}
