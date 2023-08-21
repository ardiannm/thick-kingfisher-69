"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthcheck = void 0;
const express_1 = __importDefault(require("express"));
exports.healthcheck = express_1.default.Router();
exports.healthcheck.use(express_1.default.json());
/**
 * @openapi
 * /healthcheck:
 *  get:
 *    tags:
 *      - Healthcheck
 *    description: Responds if server is up and running
 *    responses:
 *      200:
 *        description: Server is up and running
 */
exports.healthcheck.get("/", async (_, res) => res.sendStatus(200));
