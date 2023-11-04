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
    if (valueMap.has(ref)) return valueMap.get(ref).observers;
    return new Set<string>();
  }

  function assignReference(token: Reference, value: SystemNumber, callbackFn: (token: Reference) => SystemNumber) {
    var observers = getObservers(token.reference);
    valueMap.set(token.reference, new SystemReference(value, observers));
    subscribe(token);
    unsubscribe(token);
    referenceMap.set(token.reference, token);
    // notify observers that this reference has changed
    observers.forEach((ref) => {
      const token = referenceMap.get(ref) as Reference;
      callbackFn(token);
    });
  }

  function subscribe(token: Reference) {
    token.observing.forEach((ref) => valueMap.get(ref).observers.add(token.reference));
  }

  function unsubscribe(token: Reference) {
    if (referenceMap.has(token.reference)) {
      var prevRefs = referenceMap.get(token.reference).observing;
      var currRefs = token.observing;
      prevRefs.forEach((ref) => {
        if (currRefs.includes(ref)) return;
        valueMap.get(ref).observers.delete(token.reference); // unsubscribe this cell from previous references
        // console.log("popped " + token.reference + " from " + ref);
      });
    }
  }

  return { assignReference, getReferenceValue, referenceMap };
}

export default Environment;
