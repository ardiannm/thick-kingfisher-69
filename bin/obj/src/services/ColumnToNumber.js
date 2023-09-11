"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ColumnToNumber(column) {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
        result = result * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return result;
}
exports.default = ColumnToNumber;
