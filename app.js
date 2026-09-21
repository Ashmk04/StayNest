require("dotenv").config()
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const session = require("express-session")
const { default: mongoose } = require("mongoose");
const mongoDBstore = require("connect-mongodb-session")(session)
const multer = require("multer");
const path = require("path")
const crypto = require("crypto")

const authRouter = require("./routes/authRouter")
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const controller = require('./controllers/errorController')
const User = require("./models/user");

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const store = mongoDBstore({
    uri: process.env.MONGODB_URI,
    collection: "sessions"
})

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "public/uploads/")
    },
    filename: (req, file, cb) =>{
        const extention = path.extname(file.originalname)
        const uniqueName = `${crypto.randomUUID()}${extention}`
        cb(null, uniqueName)
    }
})

const fileFilter = (req, file, cb) =>{
    const allowedExtentions = ['.jpg', '.jpeg', '.png', '.webp']
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ]

    const extention = path.extname(file.originalname).toLocaleLowerCase()

    if(
        allowedExtentions.includes(extention) &&
        allowedMimeTypes.includes(file.mimetype)
    ){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const multerOptions = {
    storage,
    fileFilter,
    limits: {
        fileSize: 2*1024*1024
    }
}

app.use(express.static("public"))

app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))

app.use((req, res, next) =>{
    req.isLoggedin = req.session.isLoggedin || false
    res.locals.isLoggedin = req.isLoggedin
    next()
})

app.use(async (req, res, next) => {
    try {
        req.user = null

        if (req.session.userId) {
            req.user = await User.findById(req.session.userId)
                .select("-password")
                .lean()
        }

        res.locals.user = req.user
        next()
    } catch (error) {
        next(error)
    }
});

app.use((req, res, next) => {
    multer(multerOptions).single("image")(req, res, (err) => {

        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).render("host/editHome", {
                    pageTitle: 'Register Home',
                    currentPage: "add-home",
                    editing: false,
                    oldInput: [],
                    errorMessages: [
                        "Image size must be less than 2 MB."
                    ]
                });
            }

            return next(err);
        }

        next();
    });
});

app.use((req, res, next)=>{
    console.log(req.url, req.method)
    next()
})

app.use(authRouter)
app.use(storeRouter)
app.use(hostRouter)

app.use(controller.error404)

const PORT = 3004;

mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("connected to MongoDB")
        app.listen(PORT, ()=>{
            console.log(`http://localhost:${PORT}`)
        })
    }).catch(error =>{
        console.log("error while connecting to MongoDB", error)
    })