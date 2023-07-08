import { Highlighter } from "./highlighter.ts";

while (true) {
  const input = prompt("//") || "";
  const highlighter = new Highlighter(input);
  const io = highlighter.toString({ simple: true });
  console.log(io);
}
