import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Home.css";
import TopNav from "../components/topnav/TopNav";
import Connection from "../components/connection/Connection";
import IndividualChat from "../components/Individualchat/IndividualChat";
import Information from "../components/information/Imformation";
import Drawer from "@mui/material/Drawer";
import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentConversationId,
  setCurrentConversations,
  setOtherUserId,
  setOtherUserDetails,
} from "../app/ChatReducer";

const Home = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const otherUserId = useSelector((state) => state.chat.otherUserId);

  const [width, setWidth] = useState(window.innerWidth);
  const [infoVisible, setInfoVisible] = useState(false);

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
            console.log(err)
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
              <IndividualChat setInfoVisible={setInfoVisible} />
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
    </>
  ) : (
    <div className="home-main-container">
      <div className="home-sidebar">
        <TopNav />
        <Connection />
      </div>
      <div className="home-body-container">
        {id ? (
          <IndividualChat setInfoVisible={setInfoVisible} />
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
    </div>
  );
};

export default Home;
