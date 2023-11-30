
const Conversation = require('../modals/conversationModal');
const Message = require('../modals/messagemodal');

const NewConversation = async (req, res) => {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
    });

    try {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

const GetConversation = async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId] },
        });
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getConversationByConversationId = async (req, res) => {
    console.log("conversation is ",req.params.conversationId);

    try {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
        });
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
}


const GetConversationIncludesTwoUsers = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

const GetMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
}

const NewMessage = async (req, res) => {
    const newMessage = new Message(req.body);

    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
}


module.exports = {
    NewConversation,
    GetConversation,
    GetConversationIncludesTwoUsers,
    getConversationByConversationId,
    GetMessages,
    NewMessage,
    
}
