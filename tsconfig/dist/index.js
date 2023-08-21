"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = __importDefault(require("./environment"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const db_1 = require("./database/db");
const users_1 = __importDefault(require("./api/routes/users"));
const genius_1 = __importDefault(require("./api/routes/genius"));
const open_ai_1 = __importDefault(require("./api/routes/open.ai"));
const api_1 = __importStar(require("./api/api"));
const scrape_1 = __importDefault(require("./api/routes/scrape"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.static(__dirname));
const Api = express_1.default.Router();
Api.use("/healthcheck", api_1.Healthcheck);
Api.use("/users", users_1.default);
Api.use("/openai", open_ai_1.default);
Api.use("/genius", genius_1.default);
Api.use("/webscrape", scrape_1.default);
Api.use("/", api_1.default);
app.use("/api", Api);
app.get("/", (_, res) => res.redirect("/api"));
app.use("*", express_1.default.static(__dirname));
(0, db_1.connect)()
    .then(() => {
    app.listen(environment_1.default.PORT, () => {
        console.log(`Server PORT: http://localhost:${environment_1.default.PORT}/`);
    });
})
    .catch((error) => {
    console.error("database connection failed", error);
    process.exit(1);
});
