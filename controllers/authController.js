const { compile } = require("ejs")
const { check, validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const User = require("../models/user")

exports.getlogin = (req, res, next) => {
    res.render("auth/login",{
        pageTitle: "Login",
        currentPage: "login",
        isLoggedin: false,
        oldInput: [],

    })
}

exports.postlogin = async (req, res, next) =>{
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedin: false,
            errorMessages: ["Invalid user or password"],
            oldInput: {email},
        })
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedin: false,
            errorMessages: ["Invalid user or password"],
            oldInput: {email},
        })
    }

    req.session.isLoggedin = true
    req.session.userId = user._id.toString()
    res.redirect("/")
}

exports.postlogout =(req, res, next) =>{
    req.session.isLoggedin = false
    
    
    req.session.destroy((err)=>{
        if(err){
            return next(err)
        }
        res.clearCookie("connect.sid")
        res.redirect("/login")
    })
}

exports.checkAuth = (req, res, next) =>{
    if(req.isLoggedin){
        next()
    }else{
        res.redirect("/login")
    }
}

exports.getsignUp = (req, res, next)=>{
    res.render("auth/signup",{
        pageTitle: "signUp",
        currentPage: "signup",
        isLoggedin: false,
        oldInput: [],
    })
}

exports.postsignUp = [
    check("firstName")
        .notEmpty()
        .withMessage("first name is required")
        .trim()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("first name can only contains letters"),

    check("lastName")
        .notEmpty()
        .withMessage("first name is required")
        .trim()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("first name can only contains letters"),

    check("email")
        .isEmail()
        .withMessage("please enter a valid email")
        .normalizeEmail(),

    check("password")
        .isLength({min: 8})
        .withMessage("password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[@$!%*?&]/)
        .withMessage("Password must contain at least one special character")
        .trim(),

    check("confirmPassword")
        .trim()
        .custom((value, {req}) =>{
            if(value !== req.body.password){
                throw new Error("password do not match");
            }
            return true
        }),
    
    check("userType")
        .notEmpty()
        .withMessage("user type is required")
        .isIn(["guest", "host"])
        .withMessage("invalid user"),

    check("terms")
        .notEmpty()
        .withMessage("you must accept terms and conditions")
        .custom((value) =>{
            if(value !== "on"){
                throw new Error("you must accept terms and conditions")
            }
            return true
        }),

    (req, res, next)=>{
        
        const {firstName, lastName, email, password, userType} = req.body
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.status(422).render("auth/signup", {
                pageTitle: 'signUp',
                currentPage: "signup",
                isLoggedin: false,
                errorMessages: errors.array().map(err => err.msg),
                oldInput: {
                    firstName,
                    lastName, 
                    email, 
                    userType
                },
            })
        }
        bcrypt.hash(password, 12).then(hashedPassword =>{
            const user = new User({firstName, lastName, email, password: hashedPassword, userType})
            user.save()
        }).then(()=>{
            res.redirect("/login")
        }).catch(err=>{
            return res.status(422).render("auth/signup", {
                pageTitle: 'signUp',
                currentPage: "signup",
                isLoggedin: false,
                errorMessages: [err.msg],
                oldInput: {
                    firstName,
                    lastName, 
                    email, 
                    userType
                },
            })
        })
    }
]