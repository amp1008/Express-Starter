"use strict";

const jwt = require("jsonwebtoken");

const { logError } = require("./logger");

/*
    Function to execute SQL query.
    Function accepts query as parameter.
    Query is an object with text and values property.
*/
function executeSQL(query) {
    return new Promise(async (resolve, reject) => {
        try {
            let pool = global.POOL;
            let result = (await pool.query(query)) || {};
            resolve(result.rows || []);
        } catch (error) {
            logError({
                message: "Failed to execute SQL query",
                details: error,
            });
            reject("Failed to execute query");
        }
    });
}

/*
    Function to generate JWT token.
    Function accepts payload and expiry interval.
    Payload passed will be encoded in JWT.
*/
function generateToken(payload, expiryInterval = 30) {
    const jwtSecret = process.env.JWT_SECRET;
    return jwt.sign(payload, jwtSecret, {
        expiresIn: expiryInterval,
    });
}

/*
    Function used to decode token.
    Function accepts token as parameter.
    Token is decoded to get the encoded payload data.
*/
function decodeToken(token) {
    return new Promise((resolve, reject) => {
        try {
            const jwtSecret = process.env.JWT_SECRET;
            let decodedPayload = jwt.verify(token, jwtSecret);
            resolve(decodedPayload);
        } catch (error) {
            logError({
                message: "Failed to verify JWT token",
                details: error,
            });
            reject(error);
        }
    });
}

module.exports = {
    executeSQL,
    generateToken,
    decodeToken,
};
