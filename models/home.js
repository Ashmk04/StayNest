const mongoose = require("mongoose")
const User = require("./user")

const homeSchema = new mongoose.Schema({
        houseName: {
                type: String, required: true
        },
        contact: {
                type: Number, required: true
        },
        price: {
                
                type: Number, required: true
        },
        location: {
                type: String, required: true
        },
        rating: {
                type: Number, required: true
        },
        image: {
                type: String, required: true
        },
        description: {
                type: String, required: true
        },
        owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
        }
})

homeSchema.pre('findOneAndDelete', async function () {
        const homeId = this.getQuery()._id
        await User.updateMany(
                { favourites: homeId},
                {
                        $pull:{
                                favourites: homeId
                        }
                }
        )
})

module.exports = mongoose.model("Home", homeSchema)
