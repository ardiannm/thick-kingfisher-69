"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocs = void 0;
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const environment_1 = __importDefault(require("../environment"));
const package_json_1 = require("../package.json");
const swagger = express_1.default.Router();
swagger.use(express_1.default.json());
const options = {
    swagger: "2.0",
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MongoDB",
            version: package_json_1.version,
            description: "Starting setup for MongoDB and Express server in Typescript",
        },
    },
    apis: ["./api/**/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
swagger.use(swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
swagger.get("/json", (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(specs);
});
const swaggerDocs = (app) => {
    app.use("/api", swagger);
    console.info(`API Swagger Docs: http://localhost:${environment_1.default.PORT}/api/docs`);
};
exports.swaggerDocs = swaggerDocs;
