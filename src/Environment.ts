import Reference from "./ast/spreadsheet/Reference";
import SystemReference from "./system/SystemReference";

function Environment() {
  const references = new Map<string, Reference>();
  const values = new Map<string, SystemReference>();

  return { references, values };
}

export default Environment;
