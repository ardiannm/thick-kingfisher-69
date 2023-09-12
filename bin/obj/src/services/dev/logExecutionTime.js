"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserService_1 = require("../ParserService");
function logExecutionTime(_target, key, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const start = Date.now();
        const result = originalMethod.apply(this, args);
        const end = Date.now();
        const executionTime = end - start;
        const msg = "\t".repeat(1) + `${executionTime} ms - ${this.nameSpace}.${key}`;
        console.log(this.colorize(msg, ParserService_1.ColorCode.Blue));
        return result;
    };
    return descriptor;
}
exports.default = logExecutionTime;
