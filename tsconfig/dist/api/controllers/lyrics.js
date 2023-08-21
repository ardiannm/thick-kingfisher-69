"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeniusLyrics = void 0;
const genius_lyrics_api_1 = require("genius-lyrics-api");
const getGeniusLyrics = (title, artist, api = process.env.GENIUS_ACCESS_TOKEN) => {
    const options = {
        apiKey: api,
        title,
        artist,
        optimizeQuery: true,
    };
    return (0, genius_lyrics_api_1.getLyrics)(options)
        .then((lyrics) => lyrics)
        .catch((error) => {
        return {
            error: error.isAxiosError,
            status: error.response.status,
            message: error.message,
            ...error.response.data,
        };
    });
};
exports.getGeniusLyrics = getGeniusLyrics;
