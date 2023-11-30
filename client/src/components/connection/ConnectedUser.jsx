import React, { useEffect , useState } from "react";
import "./connection.css";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";

const ConnectedUser = ({ connection, user }) => {
  const [otherUser, setOtherUser] = useState({});

  useEffect(() => {
    let otherUser = connection?.members?.find((member) => member !== user._id);

    console.log(otherUser);
    try {
      fetch(`http://localhost:8000/auth/user/${otherUser}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setOtherUser(data.user);
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  }, [connection, user]);

 useEffect(() => {
    console.log(otherUser)
    console.log('rendered')
  }
  ,[])  

  return (
   <Link to={`/home/${connection?._id}`} style={{textDecoration:'none', color:"black"}}>
     <div className="cu-container">
      <div className="cu-avtar-div">
        <Avatar alt="Gaurang Patel" src={otherUser?.profile_pic} />
      </div>
      <div className="cu-name-email-div">
        <div className="cu-name-div">{otherUser.name}</div>
        <div className="cu-email-div">{otherUser?.email}</div>
      </div>
    </div>
    </Link>
  );
};

export default ConnectedUser;
