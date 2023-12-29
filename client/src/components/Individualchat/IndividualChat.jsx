import React, { useState, useEffect, useRef } from "react";
import Message from "../Message/Message";
import "./Individualchat.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { io } from "socket.io-client";
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
  const [userStatus, setUserStatus] = useState("offline");
  const [isCalling, setIsCalling] = useState(false);

  const socket = useRef();
  const scrollRef = useRef();
  const localVideoRef = useRef();
  const otherUserId = otherUser;
  const peerRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    socket.current = io("wss://bbchatbackend.onrender.com", {
      path: "/socket.io",
    });
    // socket.current = io("ws://localhost:8000", {
    //   path: "/socket.io",
    // });

    console.log(socket.current);

    socket.current.on("receiveOffer", handleReceiveOffer);
    socket.current.on("receiveAnswer", handleReceiveAnswer);

    socket.current.on("getMessage", (data) => {
      setCommingMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  const handleClose = () => {
    setIsCalling(false);
    localVideoRef.current.srcObject
      .getTracks()
      .forEach((track) => track.stop());
    remoteVideoRef.current.srcObject
      .getTracks()
      .forEach((track) => track.stop());
  };

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

    if (!newMessage || newMessage.trim().length <= 0) {
      return;
    }

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

  // Video Call

  const startCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log(stream);

        localVideoRef.current.srcObject = stream;

        peerRef.current = new Peer({ initiator: true, trickle: false, stream });

        peerRef.current.on("signal", (data) => {
          console.log("signal on", data);

          socket.current.emit("offer", {
            targetUserId: otherUserId,
            offer: data,
          });
        });

        peerRef.current.on("stream", (remoteStream) => {
          console.log("Received remote stream:", remoteStream);
          remoteVideoRef.current.srcObject = remoteStream;
        });

        setIsCalling(true);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const handleReceiveOffer = (data) => {
    console.log("receive offer", data);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;

        peerRef.current = new Peer({ trickle: false, stream });

        setIsCalling(true);

        peerRef.current.on("signal", (answer) => {
          console.log("signal on answer", answer);
          socket.current.emit("answer", {
            targetUserId: data.senderId,
            answer,
          });
        });

        peerRef.current.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });

        peerRef.current.signal(data.offer);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const handleReceiveAnswer = (data) => {
    console.log("receive answer", data);
    peerRef.current.signal(data.answer);
    remoteVideoRef.current.srcObject = peerRef.current.remoteStream;
    console.log("remote stream", peerRef.current.remoteStream);
  };

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
            onClick={startCall}
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
        className={!isCalling ? 'ss-ss-hidden': null}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          width={"200px"}
          height={"200px"}
          style={{ border: "1px solid black" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          width={"200px"}
          height={"200px"}
          style={{ border: "1px solid black" }}
        />
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
      {/* <Modal
        open={isCalling}
        onClose={handleClose}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ background: "white" , display:"flex" , flexDirection:"column" }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            width={"200px"}
            height={"200px"}
            style={{ border: "1px solid black" }}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            width={"200px"}
            height={"200px"}
            style={{ border: "1px solid black" }}
          />
        </div>
      </Modal> */}
    </div>
  );
};

export default IndividualChat;
