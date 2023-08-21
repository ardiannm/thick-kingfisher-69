"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swagger = void 0;
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const package_json_1 = require("../package.json");
exports.swagger = express_1.default.Router();
exports.swagger.use(express_1.default.json());
const options = {
    swagger: "2.0",
    definition: {
        openapi: package_json_1.version,
        info: {
            title: "MongoDb",
            version: package_json_1.version,
            description: "Starting setup for MongoDb and Express server in Typescript",
        },
    },
    apis: ["./api/**/*.ts"],
};
exports.swagger.use(swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup((0, swagger_jsdoc_1.default)(options)));
