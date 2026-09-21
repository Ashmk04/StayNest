const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String, required: [true, 'first name is required']
    },
    lastName: {
        type: String,
        required: [true, ' last name is required']
    },
    email: {
        type: String,
        required: [, "email is required"]
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    userType: {
        type: String,
        enum: ['guest', 'host'],
        default: 'guest'
    },
    favourites: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Home"
            }
            ],
        default: []
}
})

module.exports = mongoose.model('User', userSchema)