const express = require("express");

const { NewConversation, GetConversation, GetConversationIncludesTwoUsers , getConversationByConversationId, GetMessages , NewMessage, getunknownuserToConnect, getAllunknownuser} = require("../controllers/ChatControllers");
const router = express.Router();

router.post("/conversations", NewConversation );
router.get("/conversations/:userId", GetConversation);
router.get("/conversationsById/:conversationId", getConversationByConversationId);
router.get("/conversations/finds/:firstUserId/:secondUserId", GetConversationIncludesTwoUsers);
router.get("/messages/:conversationId", GetMessages);
router.post("/messages", NewMessage);
router.get("/searchuser/:userId/:search", getunknownuserToConnect);
router.get("/searchuser/:userId",getAllunknownuser)


module.exports = router;
