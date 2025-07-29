'use client';
import socket from '@/lib/socket';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const router = useRouter();

    const connect = async () => {
        if (!socket.connected) {
            setIsConnecting(true);
            socket.connect();
        } else {
            joinRoom();
        }
    };

    const joinRoom = () => {
        setIsConnecting(false);
        setIsConnected(true);
        socket.emit('join-room', username, roomId);
    };

    socket.on('connect', () => {
        joinRoom();
    });

    socket.on('room-joined', (roomId) => {
        console.log('Got here!');
        setIsJoined(true);
    });

    useEffect(() => {}, [isConnected]);

    if (isConnecting) {
        return <h1>Establishing a connection to the server...</h1>;
    }

    if (isConnected && !isJoined) {
        return <h1>Joining the specified room...</h1>;
    }

    if (isConnected && isJoined) {
        router.push('/room/' + roomId);
    }

    return (
        <div className="flex h-[100vh] w-[100vw] items-center justify-center">
            <div className="flex w-[50%] flex-col gap-2">
                <input
                    className="h-12 rounded-3xl border border-gray-300 p-3"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="h-12 rounded-3xl border border-gray-300 p-3"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button
                    className="h-12 rounded-3xl bg-blue-300 hover:cursor-pointer hover:bg-blue-500"
                    onClick={connect}
                >
                    Join
                </button>
            </div>
        </div>
    );
}
