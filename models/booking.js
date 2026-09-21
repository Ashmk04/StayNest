const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({
    home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Home",
        required: true
    },
    guest: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    homeTitle: {
        type: String,
        required: true
    },
    homePrice: {
        type: Number,
        required: true
    },
    homeImage: {
        type: String,
    },
    homeLocation: {
        type: String,
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    nights: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["confirmed", "cancelled"],
        default: "confirmed"
    }
})

module.exports = mongoose.model("Booking", bookingSchema)