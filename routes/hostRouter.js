const express = require("express");

const controller = require('../controllers/hostController');
const { checkAuth } = require("../controllers/authController");

const hostRouter = express.Router()

hostRouter.get("/add-home",checkAuth ,controller.addHome)
hostRouter.post("/add-home", controller.postHome)
hostRouter.get("/editHome/:homeId",checkAuth , controller.editHome)
hostRouter.get("/editHome/:homeId", controller.editHome)
hostRouter.post("/editHome", controller.posteditHome)
hostRouter.get("/editHome/:homeId",checkAuth , controller.editHome)
hostRouter.get("/listedHomes", checkAuth, controller.getlistedHomes)
hostRouter.post("/deleteHome/:homeId", controller.postdeleteHome)

module.exports = hostRouter