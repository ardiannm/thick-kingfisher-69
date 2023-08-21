"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("./src/lexer"));
while (true) {
    console.log();
    const input = prompt(">>");
    // const interpreter = new Interpreter(input);
    // interpreter.run();
    const lex = new lexer_1.default(input);
    console.log(lex);
}
