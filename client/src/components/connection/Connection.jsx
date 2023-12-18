import React, { useState, useEffect } from "react";
import "./connection.css";
import ConnectedUser from "./ConnectedUser";
import { useSelector } from "react-redux";

const Connection = () => {
  
  const user = useSelector((state) => state.auth.user);

  const [connections, setConnections] = useState([]);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_BACKEND_ADDR}/api/conversations/${user?._id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setConnections(data);
      })
      .catch((err) => console.log(err));
  }, [user]);

  return (
    <div className="c-main-div">
      <div className="c-search-input">
        <input type="text" placeholder="Search" className="" />
      </div>

      {connections.length &&
        connections?.map((connection, index) => {
          return (
            <ConnectedUser key={index} connection={connection} user={user} />
          );
        })}
    </div>
  );
};

export default Connection;
