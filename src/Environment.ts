import ParserService from "./ParserService";
import Reference from "./ast/spreadsheet/Reference";
import SystemNumber from "./system/SystemNumber";
import SystemReference from "./system/SystemReference";

function Environment() {
  const references = new Map<string, Reference>();
  const values = new Map<string, SystemReference>();
  const { throwError } = ParserService();

  function referenceValue(reference: string): SystemNumber {
    if (values.has(reference)) return values.get(reference).value;
    throwError(`Environment: reference \`${reference}\` is not defined`);
  }

  function referenceObservers(reference: string): Set<string> {
    if (values.has(reference)) return values.get(reference).referencedBy;
    return new Set<string>();
  }

  function assignReference() {}

  return { references, values, referenceValue, referenceObservers };
}

export default Environment;
