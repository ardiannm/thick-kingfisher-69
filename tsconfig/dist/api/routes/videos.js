"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videos = void 0;
const express_1 = __importDefault(require("express"));
exports.videos = express_1.default.Router();
exports.videos.use(express_1.default.json());
/**
 * @openapi
 * /api/videos:
 *  post:
 *    tags:
 *      - Videos
 *    description: Download video by URL
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              videoUrl:
 *                type: string
 *                description: URL of the video to download
 *    responses:
 *      200:
 *        description: Video downloaded successfully
 *      400:
 *        description: Bad request, URL parameter is missing
 *      500:
 *        description: Internal server error
 */
exports.videos.post("/", async (req, res) => {
    const { videoUrl } = req.body;
    if (!videoUrl) {
        return res.status(400).send("URL parameter is missing");
    }
    const result = await fetch(videoUrl)
        .then((res) => res.blob())
        .then((file) => {
        const tempUrl = URL.createObjectURL(file);
        return tempUrl;
    });
    console.log(result);
    res.status(200).json(result);
});
