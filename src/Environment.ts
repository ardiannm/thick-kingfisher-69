import ParserService from "./ParserService";
import Reference from "./ast/spreadsheet/Reference";
import SystemNumber from "./system/SystemNumber";
import SystemReference from "./system/SystemReference";

function Environment() {
  const { throwError } = ParserService();

  const references = new Map<string, Reference>();
  const values = new Map<string, SystemReference>();

  function referenceValue(ref: string): SystemNumber {
    if (values.has(ref)) return values.get(ref).value;
    throwError(`Environment: reference \`${ref}\` is not defined`);
  }

  function observers(ref: string): Set<string> {
    if (values.has(ref)) return values.get(ref).referencedBy;
    return new Set<string>();
  }

  function assignReference(token: Reference, value: SystemNumber) {
    // store the cell value
    values.set(token.reference, new SystemReference(value, observers(token.reference)));

    // distribute this cell reference all other cells that this cell is referencing
    token.referencing.forEach((ref) => values.get(ref).referencedBy.add(token.reference));

    if (references.has(token.reference)) {
      // remove this cell reference from all other cells that are no longer being referenced by it
      console.log(references.get(token.reference));
    }

    // finally store the cell as a token for future re-evaluations
    references.set(token.reference, token);
  }

  return { references, assignReference, observers, referenceValue };
}

export default Environment;
