"use strict";

const express = require("express");
const router = express.Router();

const auth = require("../auth");
const user = require("./user");

/* Sample user route object */

router.get(
    "/",
    (req, res, next) => {
        req.allowed_roles = ["ADMIN"];
        next();
    },
    auth.basicAuth,
    user.fetchUsers
);
router.post(
    "/",
    (req, res, next) => {
        req.allowed_roles = ["ADMIN"];
        next();
    },
    auth.basicAuth,
    user.addUser
);
router.put(
    "/",
    (req, res, next) => {
        req.allowed_roles = ["ALL"];
        next();
    },
    auth.basicAuth,
    user.updateUser
);
router.delete(
    "/",
    (req, res, next) => {
        req.allowed_roles = ["ADMIN"];
        next();
    },
    auth.basicAuth,
    user.deleteUser
);
router.put("/password", user.resetPassword);
router.post(
    "/password",
    (req, res, next) => {
        req.allowed_roles = ["ADMIN"];
        next();
    },
    auth.basicAuth,
    user.createUserPassword
);

router.post("/login", user.login);
router.post("/logout", user.logout);

module.exports = router;