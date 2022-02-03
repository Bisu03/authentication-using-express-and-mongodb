const jwt = require("jsonwebtoken");


const auth = async (req, res, next) => {
    try {


        if (req.cookies.jwt === undefined) {
            res.render("login")
        } else {
            jwt.verify(req.cookies.jwt, process.env.SECRET_TOKEN)
            next()
        }


    } catch (error) {
        res.status(401).send
    }
}
module.exports = auth