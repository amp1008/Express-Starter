"use strict";

const util = require("util");

const bcrypt = require("bcrypt");
const _ = require("lodash");

const {
    executeSQL,
    generateToken,
} = require("../utilities");

const { logError } = require("../logger");

const compare = util.promisify(bcrypt.compare);


function fetchUsers(req, res) {
    res.status(200).send({});
}

function addUser(req, res) {
    res.status(201).send({});
}

function updateUser(req, res) {
    res.status(200).send({});
}

function deleteUser(req, res) {
    res.status(200).send({});
}

function resetPassword(req, res) {
    res.status(200).send({});
}

function createUserPassword(req, res) {
    res.status(200).send({});
}

/*
    /login API handler
    API is used to authenticate user based on email_address and password.
    On successful authentication x-access-token and x-refresh-token cookies are set.
*/
async function login(req, res) {
    try {
        let { email_address, password } = req.body || {};
        if (_.isEmpty(email_address) || _.isEmpty(password)) {
            return res.status(400).send({
                error: "Missing required fields",
            });
        }
        let userQuery = {
            text: "SELECT * FROM USERS WHERE EMAIL_ADDRESS = $1",
            values: [email_address],
        };
        let user = (await executeSQL(userQuery)) || [];
        user = user[0] || {};
        if (_.isEmpty(user)) {
            return res.status(400).send({
                error: "Email Address or Password is incorrect",
                error_code: "LOGIN_FAILED",
            });
        }

        let isPasswordEqual = await compare(password, user.password);
        if (!isPasswordEqual) {
            return res.status(400).send({
                error: "Email Address or Password is incorrect",
                error_code: "LOGIN_FAILED",
            });
        }

        if (user.is_password_expired) {
            return res.status(401).send({
                error: "Password expired",
                error_code: "PASSWORD_EXPIRED",
            });
        }
        delete user.password;

        let tokenExpiry = 24 * 60 * 60;
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
        
        req.session.userdata = {
            id: user.id,
            email_address: user.email_address,
        };
        req.session.save();
        let accessToken = generateToken(
            {
                email_address: user.email_address,
            },
            15 * 60
        );
        let refreshToken = generateToken(
            {
                email_address: user.email_address,
            },
            tokenExpiry
        );
        res.cookie("x-access-token", accessToken, {
            secure: true,
            maxAge: tokenExpiry * 1000,
            sameSite: "lax",
        });
        res.cookie("x-refresh-token", refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: tokenExpiry * 1000,
            sameSite: "lax",
        });
        res.status(200).send({
            result: req.session.userdata,
        });
    } catch (error) {
        logError({
            api: "/users/login",
            method: "POST",
            message: "Failed to login user",
            details: error,
            function: "login",
        });
        res.status(500).send({
            error: "Failed to sign in user",
            error_code: "UNKNOWN_ERROR",
        });
    }
}

function logout(req, res) {
    req.session.destroy();
    res.clearCookie("x-access-token");
    res.clearCookie("x-refresh-token");
    res.status(200).send({
        result: "User logged out successfully",
    });
}

module.exports = {
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
    createUserPassword,
    login,
    logout,
};