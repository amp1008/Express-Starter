"use strict";

const express = require("express");
require("dotenv").config();

const session = require("express-session");
const sessionFileStore = require("session-file-store")(session);

const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const helmet = require("helmet");

const rateLimit = require("express-rate-limit");

const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

global.BASE_PATH = __dirname;

const { logError } = require("./routes/logger");

const PORT = process.env.PORT || 5000;

const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 500,
    keyGenerator: (req) => req.sessionID,
});

const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    bodyParser.json({
        limit: "100kb",
    })
);
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(
    session({
        name: "sessionID",
        store: new sessionFileStore({}),
        cookie: {
            secure: false,
            httpOnly: true,
        },
        secret: process.env.SESSION_SECRET || "session-secret",
        resave: false,
        saveUninitialized: false,
        genid: () => uuidv4(),
    })
);

app.use(rateLimiter);
app.use(compression());
app.use(helmet());
app.use(helmet.contentSecurityPolicy());


const userRoute = require("./routes/users/userRoute");

app.get("/server-status", (req, res) => {
    res.status(200).send({
        result: "Server is up!",
    });
});
app.use("/users", userRoute);

process.on("uncaughtException", (error) => {
    logError({
        message: "uncaught exception",
        details: error,
    });
});
process.on("unhandledRejection", (error) => {
    logError({
        message: "unhandled rejection",
        details: error,
    });
});
process.on("SIGTERM", () => {
    logError({
        message: "process terminated manually",
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});
