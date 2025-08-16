import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import cors from 'cors';

const app = express();
app.use(
    cors({
        origin: 'http://localhost:3000',
    })
);
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

const sockets = {};
const rooms = {};
const messages = {};

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
        rooms[roomId].push({ id: socket.id, username: username });
        // Map socketId to user
        sockets[socket.id] = { username: username, room: roomId };

        socket.emit('room-joined', messages[roomId]);
        io.to(roomId).emit('user-joined', rooms[roomId]);
        io.to(roomId).emit('user-joined-notif', username);
    });

    socket.on('fetch-messages', ()=>{
        const roomId = sockets[socket.id].room;
        socket.emit('messages-fetched', (messages[roomId] ? messages[roomId] : []));
    });

    socket.on('send-message', (message) => {

        const _message = {
            sender_id: socket.id,
            sender_name: sockets[socket.id].username,
            message: message.message,
            time: message.time,
        }

        const room = sockets[socket.id].room;
        if (!messages[room]) {
            messages[room] = [];
        }

        messages[room].push(_message);
        io.to(sockets[socket.id].room).emit('receive-message', _message);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected!');
        const user = sockets[socket.id];
        const username = user.username;
        const room = user.room;
        console.log(`${username} has left ${room}!`);

        delete sockets[socket.id];

        rooms[room] = rooms[room].filter((user) => user.id !== socket.id);

        if (rooms[room].length === 0) {
            delete rooms[room];
            delete messages[room];
        }

        io.to(room).emit('refresh-users', rooms[room]);
    });
});

app.get('/generate-room', (req, res) => {
    let roomId = nanoid(8);
    while (rooms[roomId]) {
        roomId = nanoid(8);
        console.log('Ran once');
    }
    res.send(roomId);
});

server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
