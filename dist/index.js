"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const ImportFile_1 = __importDefault(require("./koto/services/ImportFile"));
const Parser_1 = __importDefault(require("./koto/Parser"));
const Interpreter_1 = __importDefault(require("./koto/Interpreter"));
const System_1 = __importDefault(require("./koto/system/System"));
const SystemNumber_1 = __importDefault(require("./koto/system/SystemNumber"));
const SystemString_1 = __importDefault(require("./koto/system/SystemString"));
const SystemException_1 = __importDefault(require("./koto/system/SystemException"));
let showTree = true;
const report = (tree) => console.log(JSON.stringify(tree, undefined, 3));
while (true) {
    const path = "koto/__test__/index.txt";
    const input = (0, prompt_sync_1.default)({ sigint: true })(">> ") || (0, ImportFile_1.default)(path);
    if (input.toLowerCase() === "tree".toLowerCase()) {
        showTree = !showTree;
        continue;
    }
    try {
        const program = new Parser_1.default(input, path).parse();
        if (showTree)
            report(program);
        const system = new Interpreter_1.default().evaluate(program);
        if (system instanceof SystemNumber_1.default)
            report(system.value);
        else if (system instanceof SystemString_1.default)
            report(system.value);
        else
            report(system);
    }
    catch (err) {
        if (err instanceof System_1.default)
            report(err);
        else if (err instanceof SystemException_1.default)
            console.log(err.value);
        else
            console.log(err);
    }
}
