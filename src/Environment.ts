import ParserService from "./ParserService";
import Reference from "./ast/spreadsheet/Reference";
import SystemNumber from "./system/SystemNumber";
import SystemReference from "./system/SystemReference";

function Environment() {
  const { throwError } = ParserService();

  const references = new Map<string, Reference>();
  const values = new Map<string, SystemReference>();

  function referenceValue(reference: string): SystemNumber {
    if (values.has(reference)) return values.get(reference).value;
    throwError(`Environment: reference \`${reference}\` is not defined`);
  }

  function observers(reference: string): Set<string> {
    if (values.has(reference)) return values.get(reference).referencedBy;
    return new Set<string>();
  }

  function assignReference(token: Reference, value: SystemNumber) {
    // before re-assigning remove self from current observers

    // then process with assigning this reference
    values.set(token.reference, new SystemReference(value, observers(token.reference)));
    token.referencing.forEach((ref) => values.get(ref).referencedBy.add(token.reference));
  }

  return { references, values, referenceValue, assignReference, observers };
}

export default Environment;
