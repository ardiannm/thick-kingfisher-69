"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lyrics = void 0;
const express_1 = __importDefault(require("express"));
const genius_1 = require("../controllers/genius");
exports.lyrics = express_1.default.Router();
exports.lyrics.use(express_1.default.json());
/**
 * @openapi
 * /api/lyrics:
 *  post:
 *    tags:
 *      - Lyrics
 *    description: Download video by URL
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              api:
 *                type: string
 *                description: Access token from Genius Lyrics API
 *                example: XXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXX
 *              title:
 *                type: string
 *                description: Title of the song
 *                example: Not Afraid
 *              artist:
 *                type: string
 *                description: Artist of the song
 *                example: Eminem
 *    responses:
 *      200:
 *        description: Lyrics fetched successfully
 *      400:
 *        description: Bad request, missing access token parameter is missing
 *      401:
 *        description: The access token provided is expired, revoked, malformed or invalid for other reasons
 *      500:
 *        description: Internal server error
 */
exports.lyrics.post("/", async (req, res) => {
    const { api, title, artist } = req.body;
    if (!api || !title || !artist) {
        return res.status(400).send("Bad request, epxecting three arguments: api, title, artist");
    }
    const response = (await (0, genius_1.getGeniusLyrics)(title, artist, api));
    if (response.error) {
        return res.status(response.status).json({ response });
    }
    res.status(200).json(response);
});
