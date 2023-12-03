
const Conversation = require('../modals/conversationModal');
const Message = require('../modals/messagemodal');
const User = require('../modals/usermodal');

const NewConversation = async (req, res) => {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
    });


    let user = await User.findOne({ _id: req.body.senderId });
    let otherUser = await User.findOne({ _id: req.body.receiverId });

    user.connected_users.push(req.body.receiverId);
    otherUser.connected_users.push(req.body.senderId);

    await user.save();
    await otherUser.save();


    try {
        const savedConversation = await newConversation.save();
        res.status(200).json({
            status: "success",
            data: savedConversation,
            user: user,
        });
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
    console.log("conversation is ", req.params.conversationId);

    try {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
        });
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getunknownuserToConnect = async (req, res) => {
    const user = await User.findOne({ _id: req.params.userId });
    const search = req.params.search
    const connected_users = user.connected_users;

    try {

        const all_user = await User.find({ $and: [{ _id: { $nin: connected_users } }, { _id: { $ne: req.params.userId } }, { name: { $regex: search, $options: "i" } }] });
        res.status(200).json(all_user);
    } catch (err) {
        res.status(500).json(err);
    }
}
const getAllunknownuser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.userId });
    const connected_users = user.connected_users;

    try {

        const all_user = await User.find({ $and: [{ _id: { $nin: connected_users } }, { _id: { $ne: req.params.userId } }] });
        res.status(200).json(all_user);
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
    getunknownuserToConnect,
    getAllunknownuser,
    GetMessages,
    NewMessage,

}
