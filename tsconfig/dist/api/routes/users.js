"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../../database/db");
const Users = express_1.default.Router();
Users.use(express_1.default.json());
/**
 * @openapi
 * /api/users:
 *  get:
 *    tags:
 *      - Users
 *    summary: Retrieve all users from the database
 *    description: Retrieve all users stored in the database.
 *    responses:
 *      200:
 *        description: Users retrieved successfully
 */
Users.get("/", async (_, res) => {
    try {
        const response = (await db_1.collections.users.find({}).toArray());
        res.status(200).send(response);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.default = Users;
