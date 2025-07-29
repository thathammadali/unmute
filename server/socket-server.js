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

    socket.on('join-room', async (username, roomId) => {
        await socket.join(roomId);
        console.log(`${username} joined room ${roomId}!`);

        socket.emit('room-joined', roomId);
    });

    socket.on('get-users', (roomId) => {
        console.log(23);
        return 23;
    });
});

server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
