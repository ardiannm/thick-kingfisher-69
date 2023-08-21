"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const environment_1 = __importDefault(require("../../environment"));
const GPT3 = async (prompt, secret_api_key = environment_1.default.GPT_SECRET_KEY, model = "text-davinci-003", temperature = 0.1, max_tokens = 700, top_p = 1, frequency_penalty = 0, presence_penalty = 0) => {
    if (!prompt)
        throw {
            status: 400,
            message: "Bad request, please provide a prompt",
        };
    const configuration = new openai_1.Configuration({ apiKey: secret_api_key });
    const openai = new openai_1.OpenAIApi(configuration);
    const options = {
        model,
        prompt: `${prompt}`,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
    };
    try {
        const completion = await openai.createCompletion(options);
        return completion.data.choices[0].text.trim();
    }
    catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                ...error.response.data.error,
            };
        }
        else {
            throw { message: error.message };
        }
    }
};
exports.default = GPT3;
