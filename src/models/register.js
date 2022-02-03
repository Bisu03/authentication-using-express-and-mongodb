
const bcrypt = require("bcryptjs");
const Mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const registerSchema = new Mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

registerSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, process.env.SECRET_TOKEN)
        // this.tokens = this.tokens.concat({ token });

        // await this.save();
        return token;

    } catch (error) {
        res.send(error)
    }
}


registerSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 10)
    this.confirmpassword = await bcrypt.hash(this.password, 10)
})

const Register = new Mongoose.model("Register", registerSchema)
module.exports = Register;