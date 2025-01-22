const mongoose = require("mongoose")
const { mongodb } = require("./config")

module.exports = async () => {
    await mongoose.connect(mongodb)

    return mongoose
}

mongoose.connection.on("connected", () => {
    console.log("MongoDB has connected !")
})