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

const sockets = {};
const rooms = {};

io.on('connection', (socket) => {
    console.log('User Connected!');

    // When someone joins the room
    socket.on('join-room', async (username, roomId) => {
        await socket.join(roomId);
        console.log(`${username} joined room ${roomId}!`);

        // Add user to room
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(username);
        // Map socketId to user
        sockets[socket.id] = { username: username, room: roomId };

        socket.emit('room-joined', roomId);
        io.to(roomId).emit('user-joined', rooms[roomId]);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected!');
        const user = sockets[socket.id];
        const username = user.username;
        const room = user.room;
        console.log(`${username} has left ${room}!`);

        rooms[room] = rooms[room].filter((user) => user !== username);

        io.to(room).emit('refresh-users', rooms[room]);
    });
});

server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
