import React from "react";
import "./topnav.css";
import Avatar from "@mui/material/Avatar";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import Badge from "@mui/material/Badge";
import IconButton from '@mui/material/IconButton';

const TopNav = () => {
  return (
    <div className="tn-container">
      <div className="tn-avtar-div">
        <Avatar alt="Gaurang Patel" src="sf.png" />
      </div>
      <div className="tn-name-email-div">
        <div className="tn-name-div">Gaurang Patel</div>
        <div className="tn-email-div">gaurang@gmail.com</div>
      </div>
      <div className="tn-notification-div">
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
      </div>
    </div>
  );
};

export default TopNav;
