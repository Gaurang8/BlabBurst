import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./AuthReducer"; 
import chatReducer from "./ChatReducer";

const rootReducer = combineReducers({
    auth: authReducer,
    chat: chatReducer
})

export default rootReducer