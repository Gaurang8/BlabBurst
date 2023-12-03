import React, { useEffect, useState , useContext } from "react";
import "./topnav.css";
import Avatar from "@mui/material/Avatar";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";

//
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";

import {AuthContext} from "../../AuthContext";

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

const TopNav = () => {
  const [open, setOpen] = useState(false);

  const {user , setUser} = useContext(AuthContext);
  const [searchUser, setSearchUser] = useState("");
  const [searchUserList, setSearchUserList] = useState([]);


  const getSearchedUser = async (searchTerm) => {

    let url = `http://localhost:8000/api/searchuser/${user?._id}/`;

    if(searchTerm){
      url += searchTerm + "/";
    }

    try{

      fetch(url , {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.json())
      .then((data) => {
        setSearchUserList(data);
      });

    }
    catch(err){
      console.log(err);
    }

  }

  useEffect(() => {

    // debounce
    const timeoutId = setTimeout(() => {
      getSearchedUser(searchUser);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchUser]);



  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const AddConversation = async (user_id) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/conversations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: user?._id,
            receiverId: user_id,
          }),
        }
      );

      const data = await res.json();
      setUser(data?.user)
      getSearchedUser(searchUser);
    } catch (err) {
      console.log(err);
    }
  }


  return (
    <>
      <div className="tn-container">
        <div className="tn-avtar-div">
          <Avatar alt="Gaurang Patel" src="sf.png" />
        </div>
        <div className="tn-name-email-div">
          <div className="tn-name-div">Gaurang Patel</div>
          <div className="tn-email-div">gaurang@gmail.com</div>
        </div>
        <div className="tn-notification-div">
          <IconButton aria-label="online" onClick={handleClickOpen}>
            <Badge
              variant="dot"
              overlap="circular"
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              color="error"
              invisible={false}
            >
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
          <Dialog
            open={open}
            onClose={handleClose}
            PaperComponent={PaperComponent}
            style={{
              
            }}
            aria-labelledby="draggable-dialog-title"
          >
            <div style={{ cursor: "move" , width:"100%" , fontSize:"20px" , fontWeight:"600" , marginBlock:"10px" }} id="draggable-dialog-title">
              Search For User
            </div>
            <div className="search-user-inp">
              <input type="text" placeholder="Search" value={searchUser} onChange={(e)=> setSearchUser(e.target.value)}/>
            </div>
            <div className="search-user-list">
              {
                searchUserList.map((item , index) => {
                  return(
                    <div className="search-user-list-item">
                    <Avatar alt={item?.name} src={item?.profile_pic} style={{height:"30px" , width:"30px" , margin:"10px" ,}} />
                    <div className="search-user-list-item-name">
                      <span>{item?.name}</span>
                      <span>{item?.email}</span>
                    </div>
                    <button className="search-user-list-item-btn"  onClick={()=>{
                      AddConversation(item?._id);
                      setSearchUser("");
                    
  }}> Add</button>
                  </div>
                  )
                })
              }
             

            </div>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default TopNav;
