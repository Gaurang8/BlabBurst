import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentConversationId: null,
    currentConversations: null,
    otherUserId: null,
    otherUserDetails: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentConversationId: (state, action) => {
            state.currentConversationId = action.payload;
        },
        setCurrentConversations: (state, action) => {
            state.currentConversations = action.payload;
        },
        setOtherUserId: (state, action) => {
            state.otherUserId = action.payload;
        },
        setOtherUserDetails: (state, action) => {
            state.otherUserDetails = action.payload;
        },
    }
});

export const { setCurrentConversationId, setCurrentConversations, setOtherUserId, setOtherUserDetails } = chatSlice.actions;
export default chatSlice.reducer;