import React , { createContext , useContext  } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    // const socket = io('ws://localhost:8000', {
    //     path: '/socket.io',
    // });
    const socket = io('wss://bbchatbackend.onrender.com', {
        path: '/socket.io',
    });

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}