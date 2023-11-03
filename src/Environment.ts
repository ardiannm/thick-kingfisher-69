import ParserService from "./ParserService";
import Reference from "./ast/spreadsheet/Reference";
import SystemNumber from "./system/SystemNumber";
import SystemReference from "./system/SystemReference";

function Environment() {
  const { throwError } = ParserService();

  const referenceMap = new Map<string, Reference>();
  const valueMap = new Map<string, SystemReference>();

  function referenceValue(ref: string): SystemNumber {
    if (valueMap.has(ref)) return valueMap.get(ref).value;
    throwError(`Environment: reference \`${ref}\` is not defined`);
  }

  function getObservers(ref: string): Set<string> {
    if (valueMap.has(ref)) return valueMap.get(ref).referencedBy;
    return new Set<string>();
  }

  function assignReference(token: Reference, value: SystemNumber) {
    valueMap.set(token.reference, new SystemReference(value, getObservers(token.reference)));
    pushReference(token);
    popReference(token);
    referenceMap.set(token.reference, token);
    // notify observers that this reference has changed
  }

  function pushReference(token: Reference) {
    token.referencing.forEach((ref) => valueMap.get(ref).referencedBy.add(token.reference));
  }

  function popReference(token: Reference) {
    if (referenceMap.has(token.reference)) {
      var prevRefs = referenceMap.get(token.reference).referencing;
      var currRefs = token.referencing;
      for (var ref of prevRefs) {
        if (currRefs.includes(ref)) continue;
        valueMap.get(ref).referencedBy.delete(token.reference); // unsubscribe this cell from previous references
        console.log("popped " + token.reference + " from " + ref);
      }
    }
  }

  return { references: referenceMap, assignReference, observers: getObservers, referenceValue };
}

export default Environment;
