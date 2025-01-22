const mongoose = require("mongoose")

const schema = mongoose.Schema({
    fivem: {
        id: {
            type: Number,
            required: false
        },
        name: {
            type: String,
            required: false
        },
    },

    firstname: {
        type: String,
        required: false
    },

    lastname: {
        type: String,
        required: false
    },

    discord_id: {
        type: String,
        required: false
    },
    
    transaction_id: {
        type: String,
        required: false
    },
    
    price: {
        type: String,
        required: false
    },
    
    payment_method: {
        type: String,
        required: false
    },
    
    email: {
        type: String,
        required: false
    },
    
    ip: {
        type: String,
        required: false
    },
    
    products: {
        type: Array,
        required: false
    },
    
    used: {
        type: Boolean,
        required: false
    },
    
    createdAt: {
        type: Date,
        required: false
    },
})

module.exports = mongoose.model("purchase", schema)