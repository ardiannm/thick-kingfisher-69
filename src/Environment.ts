import ParserService from "./ParserService";
import Reference from "./ast/spreadsheet/Reference";
import SystemNumber from "./system/SystemNumber";
import SystemReference from "./system/SystemReference";

function Environment() {
  const { throwError } = ParserService();

  const referenceMap = new Map<string, Reference>();
  const valueMap = new Map<string, SystemReference>();

  function getReferenceValue(ref: string): SystemNumber {
    if (valueMap.has(ref)) return valueMap.get(ref).value;
    throwError(`Environment: reference \`${ref}\` is not defined`);
  }

  function getObservers(ref: string): Set<string> {
    if (valueMap.has(ref)) return valueMap.get(ref).referencedBy;
    return new Set<string>();
  }

  function assignReference(token: Reference, value: SystemNumber, callback: (observer: Reference) => SystemNumber) {
    var observers = getObservers(token.reference);
    valueMap.set(token.reference, new SystemReference(value, observers));
    subscribe(token);
    unsubscribe(token);
    referenceMap.set(token.reference, token);
    // notify observers that this reference has changed
    observers.forEach((obs) => {
      const refToken = referenceMap.get(obs);
      callback(refToken);
    });
  }

  function subscribe(token: Reference) {
    token.referencing.forEach((ref) => valueMap.get(ref).referencedBy.add(token.reference));
  }

  function unsubscribe(token: Reference) {
    if (referenceMap.has(token.reference)) {
      var prevRefs = referenceMap.get(token.reference).referencing;
      var currRefs = token.referencing;
      prevRefs.forEach((ref) => {
        if (currRefs.includes(ref)) return;
        valueMap.get(ref).referencedBy.delete(token.reference); // unsubscribe this cell from previous references
        // console.log("popped " + token.reference + " from " + ref);
      });
    }
  }

  return { assignReference, getReferenceValue, referenceMap };
}

export default Environment;
