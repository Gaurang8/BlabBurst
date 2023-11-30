import React from "react";
import { useParams } from "react-router-dom";
import "./Home.css";
import TopNav from "../components/topnav/TopNav";
import Connection from "../components/connection/Connection";
import IndividualChat from "../components/Individualchat/IndividualChat";

const Home = () => {
  const { id } = useParams();
  

  console.log(id);
  return (
    <div className="home-main-container">
      <div className="home-sidebar">
        <TopNav />
        <Connection />
      </div>
      <div className="home-body-container">
        {id ? (
          <IndividualChat conversationId={id} />
        ) : (
          <div className="home-body">body</div>
        )}
      </div>
      <div className="home-main-aside">aside</div>
    </div>
  );
};

export default Home;
