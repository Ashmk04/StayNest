const express = require("express");

const controller = require('../controllers/authController')

const authRouter = express.Router()

authRouter.get("/login", controller.getlogin)
authRouter.post("/login", controller.postlogin)
authRouter.post("/logout", controller.postlogout)
authRouter.get("/signup", controller.getsignUp)
authRouter.post("/signup", controller.postsignUp)

module.exports = authRouter