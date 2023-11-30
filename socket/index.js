const io = require('socket.io')(
    8001,
    {
        cors: {
            origin: '*',
        }
    }
);

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};


io.on('connection', socket => {
    console.log("connected");

    socket.on("addUser", userId => {
        addUser(userId, socket.id);
     io.emit("getOnlineuser", users );

    }
    );

    // fetch user is online ??



    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = users.find((user) => user.userId === receiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text,
            });
        }
    }
    );

    socket.on('disconnect', () => {
        console.log("disconnected");
        removeUser(socket.id);
        io.emit("getOnlineuser", users );
    }
    );
});;