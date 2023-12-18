import React from "react";
import "./information.css";
import Skeleton from "@mui/material/Skeleton";
import { useSelector } from "react-redux";

const Imformation = () => {
  const otherUserDetails = useSelector((state) => state.chat.otherUserDetails);

  return (
    <div className="IF-main-container">
      <div className="IF-profile-pic">
        {otherUserDetails?.profile_pic ? (
          <img
            src={
              otherUserDetails?.profile_pic || "https://picsum.photos/200/200"
            }
            alt=""
            width="40px"
            height="40px"
          />
        ) : (
          <Skeleton variant="circular" width={150} height={150} />
        )}
      </div>
      <div className="IF-user-name">
        {otherUserDetails?.name ? (
          <>
            <h3>{otherUserDetails?.name}</h3>
            <p>{"offline"}</p>
          </>
        ) : (
          <>
            <Skeleton variant="text" width={150} height={25} />
            <Skeleton variant="text" width={120} height={20} />
          </>
        )}
      </div>
      <div className="IF-mini-info">
        <p className="IF-primary-info">Email</p>
        {otherUserDetails?.email ? (
          <p className="IF-secondary-info">
            {otherUserDetails?.email || "Email not Provided"}
          </p>
        ) : (
          <Skeleton variant="text" width={150} height={25} />
        )}
      </div>
      <div className="IF-mini-info">
        <p className="IF-primary-info">Phone</p>
        {otherUserDetails?.phone_number ? (
          <p className="IF-secondary-info">
            {"+91 " + otherUserDetails?.phone_number || "Phone not Provided"}
          </p>
        ) : (
          <Skeleton variant="text" width={150} height={25} />
        )}
      </div>
      <div className="IF-mini-info">
        <p className="IF-primary-info">Address</p>
       {
            otherUserDetails?.address ? (
                <p className="IF-secondary-info">
                {otherUserDetails?.address || "Address not Provided"}
              </p>
            ) : (
            <Skeleton variant="text" width={150} height={25} />
            )
       }
      </div>
      <div className="IF-mini-info">
        <p className="IF-primary-info">Joined</p>
       {
            otherUserDetails?.createdAt ? (
                <p className="IF-secondary-info">
                {otherUserDetails?.createdAt || "Join not Found"}
              </p>
            ) : (
            <Skeleton variant="text" width={150} height={25} />
            )
       }
      </div>

      {
        otherUserDetails !== null && <div className="Block-btn">Block</div>
      }
    </div>
  );
};

export default Imformation;
