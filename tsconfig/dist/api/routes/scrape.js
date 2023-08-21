"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
// import jsonFromHTML from "jsonfromhtml";
const Webscrapper = express_1.default.Router();
Webscrapper.use(express_1.default.json());
/**
 * @openapi
 * /api/webscrape:
 *  get:
 *    tags:
 *      - Webscrapper
 *    summary: Scrape website content
 *    description: Fetches and extracts relevant content from a given website URL using web scraping techniques. The endpoint accepts a URL as a query parameter and returns the website's title, meta description, and specified content.
 *    parameters:
 *      - in: query
 *        name: url
 *        schema:
 *          type: string
 *        required: true
 *        description: URL of the website to scrape
 *    responses:
 *      200:
 *        description: Successful response with scraped data
 */
Webscrapper.get("/", async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }
    try {
        const response = await axios_1.default.get(url);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch or extract data from the website" });
    }
});
exports.default = Webscrapper;
