import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User Connected!');

    // When someone joins the room
    socket.on('join-room', async (username, roomId) => {
        await socket.join(roomId);
        console.log(`${username} joined room ${roomId}!`);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        rooms[roomId].push(username);

        socket.emit('room-joined', roomId);
        io.to(roomId).emit('user-joined', rooms[roomId]);
    });

    // When someone loads the room
    socket.on("prepare-room", (roomId) => {
        socket.emit("room-prepared", rooms[roomId]);
    })
});

server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
