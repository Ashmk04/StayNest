
const express = require("express");

const controller = require('../controllers/storeController');
const { checkAuth } = require("../controllers/authController");

const storeRouter = express.Router()

storeRouter.get("/", controller.getStayNest)
storeRouter.get("/StayNestHomes", checkAuth, controller.getStayNestHomes)
storeRouter.get("/my-bookings", checkAuth,controller.getbookings)
storeRouter.post("/cancel-booking/:id", checkAuth,controller.postbookingCancel)
storeRouter.get("/bookings/booking-form/:id", checkAuth,controller.getbookingForm)
storeRouter.post("/bookings/booking-confirmation", checkAuth,controller.postbookingForm)
storeRouter.get("/bookings/booking-confirmation/:bookingId",checkAuth, controller.getBookingConfirmation
);
storeRouter.get("/favHomes", checkAuth,controller.getfavHomes)
storeRouter.post("/favHomes", controller.postfavourites)
storeRouter.get("/home/:id", checkAuth,controller.gethomeDetails)
storeRouter.post("/deleteFavouriteHome/:id", controller.postdeleteFavouriteHome)

module.exports = storeRouter
