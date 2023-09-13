"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const ImportFile_1 = __importDefault(require("./src/services/ImportFile"));
const Parser_1 = __importDefault(require("./src/Parser"));
const Interpreter_1 = __importDefault(require("./src/Interpreter"));
const System_1 = __importDefault(require("./src/system/System"));
const SystemNumber_1 = __importDefault(require("./src/system/SystemNumber"));
const SystemString_1 = __importDefault(require("./src/system/SystemString"));
const SystemException_1 = __importDefault(require("./src/system/SystemException"));
let showTree = false;
let doEvaluate = false;
const report = (tree) => console.log(JSON.stringify(tree, undefined, 3));
console.log(`   - tree ${showTree ? "is" : "is not"} active for logging`);
console.log(`   - interpreter ${doEvaluate ? "will" : "won't"} be evaluating`);
console.log();
while (true) {
    const path = "bin/index.txt";
    const input = (0, prompt_sync_1.default)({ sigint: true })("> ") || (0, ImportFile_1.default)(path);
    if (input.toLowerCase() === "tree".toLowerCase()) {
        showTree = !showTree;
        console.log();
        console.log(`   - tree ${showTree ? "is now active" : "is now inactive"} for logging`);
        console.log();
        continue;
    }
    if (input.toLowerCase() === "interpreter".toLowerCase()) {
        doEvaluate = !doEvaluate;
        console.log();
        console.log(`   - interpreter ${doEvaluate ? "is ready for evaluation" : "is deactivated"}`);
        console.log();
        continue;
    }
    console.log();
    try {
        const parser = new Parser_1.default(input, path);
        const program = parser.parse();
        if (showTree)
            report(program);
        if (doEvaluate) {
            const system = new Interpreter_1.default().evaluate(program);
            if (system instanceof SystemNumber_1.default)
                report(system.value);
            else if (system instanceof SystemString_1.default)
                report(system.value);
            else
                report(system);
        }
    }
    catch (err) {
        if (err instanceof System_1.default)
            report(err);
        else if (err instanceof SystemException_1.default)
            console.log(err.value);
        else
            console.log(err);
    }
    console.log();
}
