"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ImportFile = (path) => {
    return (0, fs_1.readFileSync)(path, "utf-8");
};
exports.default = ImportFile;
