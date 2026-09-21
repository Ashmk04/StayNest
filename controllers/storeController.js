const fs = require("fs")
const path = require("path")
const Booking = require('../models/booking');
const Home = require('../models/home');
const User = require('../models/user');

exports.getStayNest = async (req, res, next) => {

    Home.find().then((registeredHomes)=>{
        res.render("store/StayNest",{
            registeredHomes,
            pageTitle: "StayNest",
            currentPage: "StayNest",
        })
    })
}

exports.getStayNestHomes = (req, res, next) => {
    Home.find().then((registeredHomes) => {
        res.render("store/StayNestHomes", {
            registeredHomes,
            pageTitle: "StayNestHomes",
            currentPage: "Homes",
        })
    })
}

exports.getbookings = async (req, res, next) => {
    try {

        const bookings = await Booking.find({
            guest: req.user._id
        })
        .populate("home")
        .sort({ checkIn: 1 })
        .lean();

        res.render("store/bookings/my-bookings", {
            bookings,
            pageTitle: "My Bookings",
            currentPage: "bookings"
        });

    } catch (error) {
        next(error);
    }
}

exports.postbookingCancel = async (req, res, next) =>{
    try{
        const bookingId = req.params.id
        console.log(bookingId)

        const booking = await Booking.findOne({
            _id: req.params.id,
            guest: req.user._id
        })

        if(!booking){
            return res.redirect("/404")
        }

        if(booking.status === "cancelled"){
            return res.redirect("/my-bookings");
        }

        booking.status = "cancelled"

        await booking.save()

        res.redirect("/my-bookings")

    }catch(err){
        next(err)
    }
}

exports.getbookingForm = async (req, res, next) => {
    const homeId = req.params.id
    await Home.findById(homeId).then((home)=>{
        if(!home){
            res.redirect("/404")
        }
        res.render("store/bookings/booking-form", {
        pageTitle: "My Bookings",
        currentPage: "Bookings",
        home
        })
    })
}

exports.postbookingForm = async (req, res, next) => {
    try{
        const {homeId, checkIn, checkOut} = req.body
        const home = await Home.findById(homeId)
            if(!home){
                res.redirect("/404")
            }
            const start = new Date(checkIn)
            const end = new Date(checkOut)

            const today = new Date();
            today.setHours(0, 0, 0, 0);


            if(start < today){
                 return res.status(400).render("store/bookings/booking-form",{
                    pageTitle: "My Bookings",
                    currentPage: "Bookings",
                    home,
                    errorMessages: [
                        "Check-in date cannot be in the past."
                    ]
                })
            }

            if(end <= start){
                return res.status(400).render("store/bookings/booking-form",{
                    pageTitle: "My Bookings",
                    currentPage: "Bookings",
                    home,
                    errorMessages: ["Check-out must be after check-in"]
                })
            }

            const existingBooking = await Booking.findOne({
                home: homeId,
                status: "confirmed",
                checkIn: {$lt: end},
                checkOut: {$gt: start}
            })

            if(existingBooking){
                return res.status(400).render("store/bookings/booking-form",{
                    pageTitle: "My Bookings",
                    currentPage: "Bookings",
                    home,
                    errorMessages: ["This home is already booked for the selected dates."]
                })
            }

            const millisecondsPerDay = 1000 * 60 * 60 * 24

            const nights = Math.ceil( (end - start) / millisecondsPerDay )

            const totalPrice = nights * home.price

            const booking = await Booking.create({
                home: homeId,
                guest: req.user._id,
                homeTitle: home.houseName,
                homePrice: home.price,
                homeImage: "",
                homeLocation: home.location,
                checkIn: start,
                checkOut: end,
                nights: nights,
                totalPrice: totalPrice,
                status: "confirmed"
            })

            const originalImagePath = path.join(__dirname, "..", "public", home.image.replace(/^\/+/, ""))

            const extension = path.extname(home.image)

            const newImageName = `${booking._id}${extension}` 

            const bookingImagePath = path.join(__dirname, "..", "public", "uploads", "bookings", newImageName) 

            fs.copyFileSync(originalImagePath, bookingImagePath)

            booking.homeImage = `/uploads/bookings/${newImageName}`

            await booking.save()

            res.redirect(`/bookings/booking-confirmation/${booking._id}`)
    }catch(err){
        next(err)
    }
}

exports.getBookingConfirmation = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            guest: req.user._id
        })
        .populate("home")
        .populate("guest")
        .lean();

        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        res.render("store/bookings/booking-confirmation", {
            booking,
            pageTitle: "Booking Confirmed",
            currentPage: "bookings"
        });

    } catch (error) {
        next(error);
    }
};

exports.getfavHomes = async (req, res, next) => {
    const user = await User.findById(req.user._id).select("-password").populate("favourites").lean()
    res.render("store/favHomes", {
        favouriteHomes: user.favourites,
        pageTitle: "favourites",
        currentPage: "Favourite",
        
    })
}

exports.postfavourites = async (req, res, next) => {
    const homeId = req.body.id
    await User.findByIdAndUpdate(req.user._id,{
        $addToSet:{
            favourites: homeId
        }
    })
    res.redirect("favHomes")
}

exports.postdeleteFavouriteHome = async (req, res, next)=>{
    try{
        const homeId= req.params.id
        await User.findByIdAndUpdate(req.user._id,{
            $pull:{
                favourites: homeId
            }
        })
        res.redirect("/favHomes")
    } catch(err){
        next(err)
    }
}

exports.gethomeDetails = (req, res, next) => {
    const homeId = req.params.id
    Home.findById(homeId).then(home=>{
        if(!home){
            res.redirect("/StayNestHomes")
        }
        res.render("store/homeDetails", {
            home,
            pageTitle: "homeDetails",
            currentPage: "Homes",
        })
    })
}


