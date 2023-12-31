import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Home.css";
import TopNav from "../components/topnav/TopNav";
import Connection from "../components/connection/Connection";
import IndividualChat from "../components/Individualchat/IndividualChat";
import Information from "../components/information/Imformation";
import Drawer from "@mui/material/Drawer";
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";

import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentConversationId,
  setCurrentConversations,
  setOtherUserId,
  setOtherUserDetails,
} from "../app/ChatReducer";

import Peer from "simple-peer";
import { useSocket } from "../SocketContext.js";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const Home = () => {
  const { id } = useParams();
  const socket = useSocket();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const otherUserId = useSelector((state) => state.chat.otherUserId);

  const [width, setWidth] = useState(window.innerWidth);
  const [infoVisible, setInfoVisible] = useState(false);

  // handle Video Call

  const peerRef = useRef();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [isCalling, setIsCalling] = useState(false);

  const [invertStream, setInvertStream] = useState(false);

  useEffect(() => {
    console.log("socket", socket);

    socket.on("receiveOffer", handleReceiveOffer);
    socket.on("receiveAnswer", handleReceiveAnswer);
  }, []);

  // handle Video Call end
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
  });

  useEffect(() => {
    const getConversation = async () => {
      try {
        fetch(
          `${process.env.REACT_APP_BACKEND_ADDR}/api/conversationsById/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            dispatch(setCurrentConversationId(data._id));
            dispatch(setCurrentConversations(data));
            dispatch(
              setOtherUserId(
                data.members.find((member) => member !== user?._id)
              )
            );
          })
          .catch((err) => {
            console.log(err);
            dispatch(setCurrentConversationId(null));
            dispatch(setCurrentConversations(null));
            dispatch(setOtherUserId(null));
            dispatch(setOtherUserDetails(null));
          });
      } catch (err) {
        console.log(err);
      }
    };
    getConversation();
  }, [id]);

  const getUser = async (otherUserId) => {
    try {
      if (otherUserId === null || otherUserId === undefined) {
        return;
      }

      fetch(`${process.env.REACT_APP_BACKEND_ADDR}/auth/user/${otherUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          dispatch(setOtherUserDetails(data.user));
        })
        .catch((err) => console.log("ss"));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUser(otherUserId);
  }, [otherUserId]);

  // handle Video Call functions

  const startCall = (otherUserId) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {

        console.log("stream----------------", stream);

        localVideoRef.current.srcObject = stream;

        setIsCalling(true);

        peerRef.current = new Peer({ initiator: true, trickle: false, stream });

        peerRef.current.on("signal", (data) => {
          console.log("signal on", data);

          socket.emit("offer", {
            targetUserId: otherUserId,
            offer: data,
          });
        });

        peerRef.current.on("stream", (remoteStream) => {
          console.log("Received remote stream:", remoteStream);
          remoteVideoRef.current.srcObject = remoteStream;
          setIsCalling(true);
        });
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
        console.log("localVideoRef", localVideoRef);

        setIsCalling(true);

        peerRef.current = new Peer({ trickle: false, stream });

        peerRef.current.on("signal", (answer) => {
          console.log("signal on answer", answer);
          socket.emit("answer", {
            targetUserId: data.senderId,
            answer,
          });
        });

        peerRef.current.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log("Received remote videp:", remoteVideoRef);
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
  };

  // const handleClose = () => {
  //   setIsCalling(false);
  //   localVideoRef.current.srcObject
  //     .getTracks()
  //     .forEach((track) => track.stop());
  //   remoteVideoRef.current.srcObject
  //     .getTracks()
  //     .forEach((track) => track.stop());

  //   peerRef.current.destroy();
  //   peerRef.current = null;
  // };

  useEffect(() => {
    console.log("local stream --00--00--", localVideoRef.current.srcObject);
    // console.log("remote stream --00--00--", remoteVideoRef.current.srcObject);
  }, [localVideoRef.current]);

  return width < 768 ? (
    <>
      {!id ? (
        <>
          <div className="home-main-container">
            <div className="home-sidebar">
              <TopNav />
              <Connection />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="home-main-container">
            <div className="home-body-container">
              <IndividualChat
                setInfoVisible={setInfoVisible}
                startCall={startCall}
              />
            </div>
          </div>
          <div
            className="home-main-aside"
            // onClick={() => setInfoVisible(!infoVisible)}
          >
            {width > 1000 ? (
              <Information />
            ) : (
              <Drawer
                anchor="right"
                open={infoVisible}
                onClose={() => setInfoVisible(false)}
              >
                <Information />
              </Drawer>
            )}
          </div>
        </>
      )}
      {
        <div
          style={{
            display: "none",
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            width={"0"}
            height={"0"}
            style={{ border: "none" }}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            width={"0"}
            height={"0"}
            style={{ border: "none" }}
          />
        </div>
      }
      <Dialog
        open={isCalling}
        // onClose={}
        PaperComponent={PaperComponent}
        style={{
          position: "relative",
        }}
        aria-labelledby="draggable-dialog-title"
      >
        <div id="draggable-dialog-title">
          <div className="h-reciever-vcall">
            <video
              ref={ remoteVideoRef }
              autoPlay
              playsInline
              muted
              style={{ border: "1px solid black" }}
            />
            <div className="h-sender-vcall">
              <video
                ref={ localVideoRef}
                // src={localStream}
                autoPlay
                playsInline
                style={{ border: "1px solid black" }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  ) : (
    <div className="home-main-container">
      <div className="home-sidebar">
        <TopNav />
        <Connection />
        {
          <div
            style={{
              display: "none",
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              width={"0"}
              height={"0"}
              style={{ border: "none" }}
            />
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              width={"0"}
              height={"0"}
              style={{ border: "none" }}
            />
          </div>
        }
      </div>
      <div className="home-body-container">
        {id ? (
          <IndividualChat
            setInfoVisible={setInfoVisible}
            startCall={startCall}
          />
        ) : (
          <div className="home-body">
            <div className="home-body-text-xr">
              <h1>Welcome to BlabBurst</h1>
              <p>Click on a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
      <div
        className="home-main-aside"
        onClick={() => setInfoVisible(!infoVisible)}
      >
        {width > 1000 ? (
          <Information />
        ) : (
          <Drawer
            anchor="right"
            open={infoVisible}
            onClose={() => setInfoVisible(false)}
          >
            <Information />
          </Drawer>
        )}
      </div>
      <Dialog
        open={isCalling}
        // onClose={}
        PaperComponent={PaperComponent}
        style={{
          position: "relative",
          overflow: "auto",
        }}
        aria-labelledby="draggable-dialog-title"
      >
        <div id="draggable-dialog-title">
          <div className="h-reciever-vcall">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              style={{ border: "1px solid black" }}
            />
            <div
              className=""
              onClick={() => {
                setInvertStream(!invertStream);
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                style={{ border: "1px solid black" }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Home;
