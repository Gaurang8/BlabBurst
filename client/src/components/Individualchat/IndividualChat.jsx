import React, { useState, useEffect, useRef } from "react";
import Message from "../Message/Message";
import "./Individualchat.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { AuthContext } from "../../AuthContext";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const IndividualChat = ({ setInfoVisible }) => {
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
  const socket = useRef();
  const scrollRef = useRef();
  const [userStatus, setUserStatus] = useState("offline");

  const [containerheight , setContainerHeight] = useState(window.innerHeight - 120)

  useEffect(() => {
    socket.current = io("wss://bbchatbackend.onrender.com", {
      path: "/socket.io",
    });

    console.log(socket.current);

    socket.current.on("getMessage", (data) => {
      setCommingMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    console.log("Other User:", otherUser);
    socket.current.on("getOnlineuser", (onlineUsers) => {
      console.log("Online Users:", onlineUsers);
      console.log("Other User:", otherUser);
      const onlineUser = onlineUsers.find((user) => user.userId === otherUser);
      console.log("Online Status for Other User:", onlineUser);
      setUserStatus(onlineUser ? "online" : "offline");
    });

    // return () => {
    //   socket.current.disconnect();
    // };
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
    socket.current.emit("addUser", user._id);
    console.log("User connected");

    return () => {
      console.log("User disconnected");
      socket.current.disconnect();
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: conversationId,
    };

    socket.current.emit("sendMessage", {
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

  return (
    <div className="">
      <div className="IC-user-info" onClick={() => setInfoVisible(true)}>
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
        <div className="IC-user-name">
          <h3>{otherUserDetails?.name}</h3>
          <p>{userStatus}</p>
        </div>
      </div>
      <div
        className="IC-container"
        style={{
          maxHeight: `${containerheight}px`,
        }}
      >
        {messages.map((message, index) => {
          return (
            <div key={index} ref={scrollRef}>
              <Message message={message} own={message.sender === user._id} />
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="IC-input">
          <input
            type="text"
            placeholder="Type a message..."
            onChange={(e) => setNewMessage(e.target.value)}
            value={newMessage}
            onFocus={()=>{
              setContainerHeight(window.innerHeight - 120) 
            }}
            onBlur={()=>{
              setContainerHeight(window.innerHeight - 120)
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            // onSubmitEditing={(e) => e.preventDefault()}
          />
          <button type="submit" onTouchEnd={handleTouchEnd}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default IndividualChat;
