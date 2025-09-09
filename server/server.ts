// server/socket-server.ts
import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import { createWorker, types as mediasoupTypes } from 'mediasoup';
import cors from 'cors';
import { Rooms, SocketMessage } from './types';

// =======================
// Setup Express + Socket.IO
// =======================
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

// =======================
// State
// =======================
const sockets: Record<string, { username: string; room: string }> = {};

const rooms: Rooms = {};
const messages: Record<string, SocketMessage[]> = {};

const worker = await createWorker();
const routers: mediasoupTypes.Router[] = [];

// =======================
// Media Codecs
// =======================
const mediaCodecs = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: { 'x-google-start-bitrate': 1000 },
    },
] as mediasoupTypes.RtpCodecCapability[];

// =======================
// Socket.IO logic
// =======================
io.on('connection', (socket: Socket) => {
    console.log('User Connected!', socket.id);

    // Join room
    socket.on('join-room', async (username: string, roomId: string) => {
        await socket.join(roomId);
        console.log(`${username} joined room ${roomId}!`);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                peers: [],
                messages: [],
                router: await worker.createRouter({ mediaCodecs }),
                transports: {},
                producers: {},
                consumers: {},
            };
            routers.push(rooms[roomId].router);
        }

        rooms[roomId].peers.push(socket.id);
        sockets[socket.id] = { username, room: roomId };

        socket.emit('room-joined', messages[roomId] ?? []);
        io.to(roomId).emit('user-joined', rooms[roomId]);
        io.to(roomId).emit('user-joined-notif', username);
    });

    // Fetch messages
    socket.on('fetch-messages', () => {
        const roomId = sockets[socket.id]?.room;
        if (!roomId) return;

        socket.emit('messages-fetched', messages[roomId] ?? []);
    });

    // Send message
    socket.on('send-message', (message: { message: string; time: string }) => {
        const user = sockets[socket.id];
        if (!user) return;

        const _message: SocketMessage = {
            sender_id: socket.id,
            sender_name: user.username,
            message: message.message,
            time: message.time,
        };

        const roomId = user.room;
        if (!messages[roomId]) messages[roomId] = [];
        messages[roomId].push(_message);

        io.to(roomId).emit('receive-message', _message);
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = sockets[socket.id];
        if (!user) return;

        const { username, room } = user;
        console.log(`${username} has left ${room}!`);

        delete sockets[socket.id];

        const roomData = rooms[room];
        if (roomData) {
            roomData.peers = roomData.peers.filter((id) => id !== socket.id);

            if (roomData.peers.length === 0) {
                delete rooms[room];
                delete messages[room];
            }
        }

        io.to(room).emit('refresh-users', rooms[room]);
    });
});

// =======================
// Routes
// =======================
app.get('/generate-room', (req: Request, res: Response) => {
    let roomId = nanoid(8);
    while (rooms[roomId]) {
        roomId = nanoid(8);
        console.log('Ran once');
    }
    res.send(roomId);
});

// =======================
// Start Server
// =======================
server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
