import { useSelector } from "react-redux";
import "./message.css";
import { format } from "timeago.js";

export default function Message({ message, own }) {

  const otherUserDetails = useSelector((state) => state.chat.otherUserDetails);
  const user = useSelector((state) => state.auth.user);

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          className="messageImg"
          src={
            own 
              ? ( user?.profile_pic || "https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500" )
              : ( otherUserDetails?.profile_pic || "https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500" )
          
          }
          alt=""
        />
        <p className="messageText">{message?.text}</p>
      </div>
      <div className="messageBottom">{format(message?.createdAt)}</div>
    </div>
  );
}