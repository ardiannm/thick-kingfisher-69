"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const open_ai_1 = __importDefault(require("../controllers/open.ai"));
const OpenAI = express_1.default.Router();
OpenAI.use(express_1.default.json());
/**
 * @swagger
 * /api/openai:
 *   post:
 *     summary: Get a response from OpenAI
 *     tags: [OpenAI]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 default: "text-davinci-003"
 *               secret_api_key:
 *                 type: string
 *                 default: "sk-....0qPM"
 *               prompt:
 *                 type: string
 *                 default: "Hello!"
 *               temperature:
 *                 type: number
 *                 default: 0.1
 *               max_tokens:
 *                 type: number
 *                 default: 700
 *               top_p:
 *                 type: number
 *                 default: 1
 *               frequency_penalty:
 *                 type: number
 *                 default: 0
 *               presence_penalty:
 *                 type: number
 *                 default: 0
 *             required:
 *               - prompt
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request, please provide a prompt
 *       429:
 *         description: You exceeded your current quota, please check your plan and billing details
 *       500:
 *         description: Internal server error
 */
OpenAI.post("/", async (req, res) => {
    const { prompt } = req.body;
    // You can add more properties to the req.body if needed and pass them to the GPT3 function.
    try {
        const response = await (0, open_ai_1.default)(prompt);
        return res.status(200).json(response);
    }
    catch (response) {
        res.status(response.status).json(response);
    }
});
exports.default = OpenAI;
