const mangoose = require('mongoose');

const conversationSchema = new mangoose.Schema({
    members: {
        type: Array,
    }
}, { timestamps: true });

module.exports = mangoose.model("Conversation", conversationSchema);