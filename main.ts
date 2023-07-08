import { Highlighter } from "./highlighter.ts";
import { loggerLog } from "./log.ts";

while (true) {
  const input = prompt("//") || "";
  const highlighter = new Highlighter(input);
  const io = highlighter.toString();

  loggerLog(io);
}
