import React, { useEffect, useState } from "react";
import "./topnav.css" ;
import Avatar from "@mui/material/Avatar";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";

//
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";

import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

import { useSelector , useDispatch } from "react-redux";
import { login } from "../../app/AuthReducer";

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
  
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);


  const [searchUser, setSearchUser] = useState("");
  const [searchUserList, setSearchUserList] = useState([]);

  const getSearchedUser = async (searchTerm) => {
    let url = `${process.env.REACT_APP_BACKEND_ADDR}/api/searchuser/${user?._id}/`;

    if (searchTerm) {
      url += searchTerm + "/";
    }

    try {
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setSearchUserList(data);
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // debounce
    const timeoutId = setTimeout(() => {
      getSearchedUser(searchUser);
    }, 300);

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
      const res = await fetch(`${process.env.REACT_APP_BACKEND_ADDR}/api/conversations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user?._id,
          receiverId: user_id,
        }),
      });

      const data = await res.json();
      dispatch(login(data?.user));
      getSearchedUser(searchUser);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="tn-container">
        <div className="tn-avtar-div">
          <Avatar alt="Gaurang Patel" src={user?.profile_pic} />
        </div>
        <div className="tn-name-email-div">
          <div className="tn-name-div">{user?.name}</div>
          <div className="tn-email-div">{user?.email}</div>
        </div>
        <div className="tn-notification-div" >
          <IconButton aria-label="online" onClick={handleClickOpen}>
            <PersonAddAlt1Icon />
          </IconButton>
          <IconButton aria-label="online">
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
            style={{}}
            aria-labelledby="draggable-dialog-title"
          >
            <div className="outer-search-connection">
              <div
                style={{
                  cursor: "move",
                  width: "100%",
                  fontSize: "20px",
                  fontWeight: "600",
                  marginBlock: "10px",
                }}
                id="draggable-dialog-title"
              >
                Search For User
              </div>
              <div className="search-user-inp">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
              </div>
              <div className="search-user-list">
                {searchUserList.map((item, index) => {
                  return (
                    <div className="search-user-list-item">
                      <Avatar
                        alt={item?.name}
                        src={item?.profile_pic}
                        style={{
                          height: "30px",
                          width: "30px",
                          margin: "10px",
                        }}
                      />
                      <div className="search-user-list-item-name">
                        <span>{item?.name}</span>
                        <span>{item?.email}</span>
                      </div>
                      <button
                        className="search-user-list-item-btn"
                        onClick={() => {
                          AddConversation(item?._id);
                          setSearchUser("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default TopNav;
