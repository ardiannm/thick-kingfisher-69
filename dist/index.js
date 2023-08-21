"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const interpreter_1 = __importDefault(require("./src/interpreter"));
while (true) {
    console.log();
    const input = (0, prompt_sync_1.default)({ sigint: true })(">> ");
    const interpreter = new interpreter_1.default(input);
    interpreter.run();
}
