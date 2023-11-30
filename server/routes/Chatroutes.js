const express = require("express");

const { NewConversation, GetConversation, GetConversationIncludesTwoUsers , getConversationByConversationId, GetMessages , NewMessage} = require("../controllers/ChatControllers");
const router = express.Router();

router.post("/conversations", NewConversation );
router.get("/conversations/:userId", GetConversation);
router.get("/conversationsById/:conversationId", getConversationByConversationId);
router.get("/conversations/finds/:firstUserId/:secondUserId", GetConversationIncludesTwoUsers);
router.get("/messages/:conversationId", GetMessages);
router.post("/messages", NewMessage);


module.exports = router;
