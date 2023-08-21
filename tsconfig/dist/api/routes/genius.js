"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const genius_1 = require("../controllers/genius");
const Genius = express_1.default.Router();
Genius.use(express_1.default.json());
/**
 * @swagger
 * /api/genius:
 *  post:
 *    tags:
 *      - Genius
 *    summary: Fetch song lyrics from Genius Lyrics API
 *    description: Fetch song lyrics from Genius Lyrics API by providing an access token, song title, and artist parameter.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *                description: Access token from Genius Lyrics API
 *                example: PM..-...J45ThnDq
 *              title:
 *                type: string
 *                description: Title of the song
 *                example: Not Afraid
 *              artist:
 *                type: string
 *                description: Artist of the song
 *                example: Eminem
 *            required:
 *              - token
 *              - title
 *              - artist
 *    responses:
 *      200:
 *        description: Lyrics fetched successfully
 *      400:
 *        description: Bad request, expecting all three required parameters i.e token, title and artist
 *      401:
 *        description: The access token provided is expired, revoked, malformed or invalid for other reasons
 *      500:
 *        description: Internal server error
 */
Genius.post("/", async (req, res) => {
    const { token, title, artist } = req.body;
    if (!token || !title || !artist) {
        return res.status(400).send("Bad request, expecting all three required arguments: token, title, artist");
    }
    const response = (await (0, genius_1.getGeniusLyrics)(title, artist, token));
    if (response.error) {
        return res.status(response.status).json({ response });
    }
    res.status(200).json(response);
});
exports.default = Genius;
