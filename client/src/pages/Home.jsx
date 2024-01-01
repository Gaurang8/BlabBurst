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
  const otherUserDetails = useSelector((state) => state.chat.otherUserDetails);

  const [width, setWidth] = useState(window.innerWidth);
  const [infoVisible, setInfoVisible] = useState(false);

  // handle Video Call

  const peerRef = useRef();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [isCalling, setIsCalling] = useState(false);
  const [waitigForCall, setWaitingForCall] = useState(false);
  // const [answerCall, setAnswerCall] = useState(false);
  const [incommingCall, setInCommingCall] = useState(false);

  const [incomingCallTimeout, setIncomingCallTimeout] = useState(null);

  useEffect(() => {
    console.log("socket", socket);

    socket.on("receiveOffer", handleReceiveOfferAccept);
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
  useEffect(() => {
    console.log("rererender");
  }, []);

  const startCall = (otherUserId) => {
    setIsCalling(true);

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 160 }, height: { ideal: 120 } },
        audio: true,
      })
      .then((stream) => {
        console.log("stream----------------", stream);
        setWaitingForCall(true);

        localVideoRef.current.srcObject = stream;

        // setIsCalling(true);

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
          // setIsCalling(true);
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const handleReceiveOfferAccept = (data) => {
    setIsCalling(true);
    console.log("setIncoming call(true)");
    setInCommingCall(true);

    const intervalId = setInterval(() => {
      setInCommingCall((prevValue) => {
        if (!prevValue) {
          console.log("enter incommingCall");
          clearInterval(intervalId);
          handleReceiveOffer(data);
          return;
        }
        console.log("incomingCallTimeout");
        return prevValue;
      });
    }, 1000);

    setIncomingCallTimeout(intervalId);

    setTimeout(() => {
      console.log("clearInterval");
      clearInterval(intervalId);
      if (incommingCall) {
        handleCallHangup();
      }
    }, 9000);
  };

  const handleReceiveOffer = (data) => {
    console.log("going to receive");

    setInCommingCall(false);

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 160 }, height: { ideal: 120 } },
        audio: true,
      })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        console.log("localVideoRef", localVideoRef);

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

  useEffect(() => {
    console.log("peer ref", peerRef.current);
    if (peerRef.current) {
      peerRef.current.on("close", () => {
        console.log("peerRef.current.on close");
        handleCallHangup();
      });
    }
  }, [peerRef.current]);

  //  get when peer is destroyed

  const handleReceiveAnswer = (data) => {
    console.log("receive answer", data);
    setWaitingForCall(false);
    peerRef.current?.signal(data.answer);
  };

  const handleCallHangup = () => {
    setIsCalling(false);
    // console.log("hanging up");
    setInCommingCall(false);

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }

    peerRef.current = null;
  };

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
        PaperComponent={PaperComponent}
        style={{
          position: "absolute",
        }}
        aria-labelledby="draggable-dialog-title"
      >
        <div id="draggable-dialog">
          <div className="h-reciever-vcall">
            <div id="draggable-dialog-title" />
            {waitigForCall && (
              <div style={{ paddingTop: "100px" }}>
                <div class="call-animation">
                  <img
                    class="img-circle"
                    src={
                      otherUserDetails?.profile_pic ||
                      "https://i.imgur.com/6VBx3io.png"
                    }
                    alt=""
                    width="100"
                  />
                </div>
              </div>
            )}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ display: waitigForCall ? "none" : "" }}
            />
            <div className="h-sender-vcall">
              <video ref={localVideoRef} autoPlay playsInline muted />
            </div>
            {!incommingCall  ? (
              <div
                className="vcall-hangup"
                onClick={() => {
                  handleCallHangup();
                }}
              >
                End
              </div>
            ) : (
              <div
                className="vcall-hangup"
                onClick={() => {
                  console.log("folseeeeee");
                  setInCommingCall(false);
                }}
              >
                Receive
              </div>
            )}
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
        PaperComponent={PaperComponent}
        style={{
          position: "absolute",
        }}
        aria-labelledby="draggable-dialog-title"
      >
        <div id="draggable-dialog">
          <div className="h-reciever-vcall">
            <div id="draggable-dialog-title" />
            {waitigForCall && (
              <div style={{ paddingTop: "100px" }}>
                <div class="call-animation">
                  <img
                    class="img-circle"
                    src={
                      otherUserDetails?.profile_pic ||
                      "https://i.imgur.com/6VBx3io.png"
                    }
                    alt=""
                    width="100"
                  />
                </div>
              </div>
            )}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ display: waitigForCall ? "none" : "" }}
            />
            <div className="h-sender-vcall">
              <video ref={localVideoRef} autoPlay playsInline muted />
            </div>
            {!incommingCall  ? (
              <div
                className="vcall-hangup"
                onClick={() => {
                  handleCallHangup();
                }}
              >
                End
              </div>
            ) : (
              <div
                className="vcall-hangup"
                onClick={() => {
                  console.log("folseeeeee");
                  setInCommingCall(false);
                }}
              >
                Receive
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Home;
