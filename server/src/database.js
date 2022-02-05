"use strict";

const { Pool } = require("pg");

let connectionString = process.env.DATABASE_URL;
connectionString = connectionString.split("?");
connectionString = connectionString[0] || "";

let connectionObj = {
    connectionString,
};

if (process.env.NODE_ENV === "production") {
    connectionObj.ssl = {
        rejectUnauthorized: false,
    };
}

const pool = new Pool(connectionObj);

global.POOL = pool;
