const path = require('path')
const fs = require('fs')

const Home = require('../models/home')


exports.addHome = (req, res, next)=>{
    res.render("host/editHome", {
        pageTitle : "Register Home",
        currentPage : "add-home",
        editing: false,
        oldInput: []
    })
}

exports.postHome = (req, res, next)=>{
    const {houseName, contact, price, location, rating, description} = req.body
    console.log(req.file)
    if(!req.file){
        return res.status(422).render("host/editHome",{
            pageTitle: 'Register Home',
            currentPage: "add-home",
            editing: false,
            errorMessages: ["Only JPG, JPEG, PNG and WEBP images are allowed"],
            oldInput: {
                houseName, 
                contact, 
                price, 
                location, 
                rating, 
                description
            }
        })
    }

    const image = `/uploads/${req.file.filename}`

    const home = new Home({
        houseName, 
        contact, 
        price, 
        location, 
        rating, 
        image,
        description,
        owner: req.user._id
    })
    home.save().then(()=>{
        res.redirect("listedHomes")
    })   
}

exports.editHome = async (req, res, next)=>{
    try
    {
        const homeId = req.params.homeId
        const editing = req.query.editing === "true"

        const home = await Home.findOne({
            _id: homeId,
            owner: req.user._id
        }).lean()

        if(!home){
            return res.redirect("/listedHomes");
        }

        res.render("host/editHome",{
            home,
            pageTitle: "Edit Home",
            currentPage: "add-home",
            editing,
            oldInput: []
        })
    }
    catch(err){
        res.redirect("/listedHomes")
    }
}

exports.posteditHome = async (req, res, next)=>{
    try{
        const {_id, houseName, contact, price, location, rating, description} = req.body

        const home = await Home.findOne({
            _id,
            owner: req.user._id
        });

        if (!home) {
            return res.status(403).send("You are not authorized to edit this home");
        }

        const updateData = {
            houseName, 
            contact, 
            price, 
            location, 
            rating, 
            description
        }

        if(req.file){
             if (home.image) {
                const imagePath = path.join(__dirname, "..", "public", home.image);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        if(req.file){
            updateData.image = `/uploads/${req.file.filename}`;
        }

        await Home.findByIdAndUpdate(_id, updateData)

        res.redirect("/listedHomes")
    } catch(err){
        next(err)
    }
}

exports.getlistedHomes = async (req, res, next)=>{
    const homes = await Home.find({owner: req.user._id})
         res.render("host/listedHomes", {
            registeredHomes: homes,
            pageTitle : "listedHomes", 
            currentPage : "listedHomes",
        })   
}

exports.postdeleteHome = async (req, res, next)=>{
    try{
        const homeId = req.params.homeId

        const home = await Home.findOne({
            _id: homeId,
            owner: req.user._id
        });

        if (!home) {
            return res.status(404).send("Home not found");
        }

        if(home.image){
            const imagePath = path.join(__dirname, "..", "public", home.image)

            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath)
            }
        }

        await Home.findByIdAndDelete(homeId)

        res.redirect("/listedHomes")

    }catch(err){
        next(err)
    }
}