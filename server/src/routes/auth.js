"use strict";
const _ = require("lodash");

const { decodeToken, generateToken } = require("./utilities");
const { logError } = require("./logger");

/*
    Middleware to authorize APIs.
    x-access-token and x-refresh-token are set as cookies on successful authentication.
    These cookies are internally used for authorization of all APIs.
    To use RBAC, we can allowed_roles request parameter.
*/
async function basicAuth(req, res, next) {
    try {
        if (_.isEmpty(req.session)) {
            return res.status(401).send({
                error: "User is not authenticated",
            });
        }
        let accessToken = req.cookies["x-access-token"] || "";
        let refreshToken = req.cookies["x-refresh-token"] || "";
        if (!accessToken) {
            return res.status(401).send({
                error: "User is not authenticated",
            });
        }

        try {
            await decodeToken(accessToken);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                await decodeToken(refreshToken);
            }
        }

        let userdata = req.session.userdata || {};
        let role = userdata.role || "";
        if (req.allowed_roles.includes("ALL")) {
            accessToken = generateToken(
                {
                    email_address: userdata.email_address,
                },
                15 * 60
            );
            res.cookie("x-access-token", accessToken, {
                secure: true,
                maxAge: (userdata.token_expiry || 24 * 60 * 60) * 1000,
                sameSite: "lax",
            });
            next();
        } else {
            if (req.allowed_roles.includes(role)) {
                accessToken = generateToken(
                    {
                        email_address: userdata.email_address,
                    },
                    15 * 60
                );
                res.cookie("x-access-token", accessToken, {
                    secure: true,
                    maxAge: (userdata.token_expiry || 24 * 60 * 60) * 1000,
                    sameSite: "lax",
                });
                next();
            } else {
                return res.status(403).send({
                    error: "User is not authorized",
                });
            }
        }
    } catch (error) {
        logError({
            method: "MIDDLEWARE",
            message: "Failed to authenticate user",
            details: error,
            function: "basicAuth",
        });
        return res.status(401).send({
            error: "User is not authenticated",
        });
    }
}

module.exports = {
    basicAuth,
};
