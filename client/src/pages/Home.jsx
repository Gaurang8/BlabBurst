import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Home.css";
import TopNav from "../components/topnav/TopNav";
import Connection from "../components/connection/Connection";
import IndividualChat from "../components/Individualchat/IndividualChat";
import Information from "../components/information/Imformation";
import { AuthContext } from "../AuthContext";
import Drawer from "@mui/material/Drawer";

const Home = () => {
  const { id } = useParams();

  const [currentConversation, setCurrentConversation] = useState(null);

  const [otherUser, setOtherUser] = useState(null);
  const [otherUserDetails, setOtherUserDetails] = useState(null);

  const { user, setUser } = useContext(AuthContext);
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
            setCurrentConversation(data);
            setOtherUser(data.members.find((member) => member !== user._id));
          })
          .catch((err) => console.log(err));
      } catch (err) {
        console.log(err);
      }
    };
    getConversation();
  }, [id]);

  useEffect(() => {
    const getUser = async () => {
      try {

        if(otherUser === null || otherUser === undefined){
          return
        }

        fetch(`${process.env.REACT_APP_BACKEND_ADDR}/auth/user/${otherUser}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setOtherUserDetails(data.user);
          })
          .catch((err) => console.log("ss"));
      } catch (err) {
        console.log(err);
      }
    };

    getUser();
  }, [otherUser]);

  console.log(id);
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
                conversationId={id}
                otherUserDetails={otherUserDetails}
                otherUser={otherUser}
                currentConversation={currentConversation}
                setInfoVisible={setInfoVisible}
              />
            </div>
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
                <Information otherUserDetails={otherUserDetails} />
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
          <IndividualChat
            conversationId={id}
            otherUserDetails={otherUserDetails}
            otherUser={otherUser}
            currentConversation={currentConversation}
            setInfoVisible={setInfoVisible}
          />
        ) : (
          <div className="home-body">body</div>
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
            <Information otherUserDetails={otherUserDetails} />
          </Drawer>
        )}
      </div>
    </div>
  );
};

export default Home;
