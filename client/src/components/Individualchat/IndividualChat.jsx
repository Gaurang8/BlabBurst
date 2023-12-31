import React, { useState, useEffect, useRef } from "react";
import Message from "../Message/Message";
import "./Individualchat.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import videoCallsvg from "../../svg/video.svg";
import callSvg from "../../svg/call.svg";
import cameraSvg from "../../svg/camera.svg";
import micSvg from "../../svg/mic.svg";
import gallarySvg from "../../svg/gallery.svg";

import IconButton from "@mui/material/IconButton";

import Peer from "simple-peer";

import Modal from "@mui/material/Modal";

import { useSocket } from "../../SocketContext.js";
 

const IndividualChat = ({ setInfoVisible , startCall }) => {

  const socket = useSocket();

  const user = useSelector((state) => state.auth.user);
  const conversationId = useSelector(
    (state) => state.chat.currentConversationId
  );
  const otherUserDetails = useSelector((state) => state.chat.otherUserDetails);
  const otherUser = useSelector((state) => state.chat.otherUserId);
  const currentConversation = useSelector(
    (state) => state.chat.currentConversations
  );

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [commingMessage, setCommingMessage] = useState(null);
  const [userStatus, setUserStatus] = useState("offline");
  const [isCalling, setIsCalling] = useState(false);

  const scrollRef = useRef();

  useEffect(() => {
    

    console.log(socket);

   

    socket.on("getMessage", (data) => {
      setCommingMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);


  useEffect(() => {
    console.log("Other User:", otherUser);
    socket.on("getOnlineuser", (onlineUsers) => {
      console.log("Online Users:", onlineUsers);
      console.log("Other User:", otherUser);
      const onlineUser = onlineUsers.find((user) => user.userId === otherUser);
      console.log("Online Status for Other User:", onlineUser);
      setUserStatus(onlineUser ? "online" : "offline");
    });

  
  }, [otherUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    commingMessage &&
      currentConversation?.members.includes(commingMessage.sender) &&
      setMessages((prev) => [...prev, commingMessage]);
  }, [commingMessage, currentConversation]);

  useEffect(() => {
    socket.emit("addUser", user._id);
    console.log("User connected");

    return () => {
      console.log("User disconnected");
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage || newMessage.trim().length <= 0) {
      return;
    }

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: conversationId,
    };

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: otherUser,
      text: newMessage,
    });

    try {
      fetch(`${process.env.REACT_APP_BACKEND_ADDR}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages([...messages, data]);
          setNewMessage("");
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getMessages = async () => {
      try {
        fetch(
          `${process.env.REACT_APP_BACKEND_ADDR}/api/messages/${conversationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            setMessages(data);
          })
          .catch((err) => console.log(err));
      } catch (err) {
        console.log(err);
      }
    };

    getMessages();
  }, [conversationId]);

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  // Video Call

  
  return (
    <div className="">
      <div className="IC-user-info">
        <div className="IC-user-info-left">
          <Link to="/home">
            <ArrowBackIcon className="IC-back-icon" />
          </Link>
          <img
            className="IC-user-img"
            src={
              otherUserDetails?.profile_pic || "https://i.imgur.com/6VBx3io.png"
            }
            alt=""
            width="40px"
            height="40px"
          />
          <div className="IC-user-name" onClick={() => setInfoVisible(true)}>
            <h3>{otherUserDetails?.name}</h3>
            <p>{userStatus}</p>
          </div>
        </div>
        <div className="IC-user-info-right">
          <IconButton
            sx={{
              padding: "0px",
            }}
          >
            <img
              className="IC-user-img"
              src={callSvg}
              alt=""
              width="40px"
              height="40px"
            />
          </IconButton>
          <IconButton
            sx={{
              padding: "0px",
            }}
            onClick={()=>{startCall(otherUser)}}
          >
            <img
              className="IC-user-img"
              src={videoCallsvg}
              alt=""
              width="40px"
              height="40px"
            />
          </IconButton>
        </div>
      </div>

      {!isCalling && (
        <div className="IC-container">
          {messages.map((message, index) => {
            return (
              <div key={index} ref={scrollRef}>
                <Message message={message} own={message.sender === user._id} />
              </div>
            );
          })}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="IC-input">
          <div className="IC-input-area">
            <img src={cameraSvg} alt="" className="IC-inp-other-img" />
            <input
              type="text"
              placeholder="Message..."
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              className="IC-input-field"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            />
            <div className="IC-inp-btn">
              {!newMessage.trim().length ? (
                <>
                  <img src={micSvg} alt="" />
                  <img src={gallarySvg} alt="" />
                </>
              ) : (
                <button type="submit" onTouchEnd={handleTouchEnd}>
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default IndividualChat;
