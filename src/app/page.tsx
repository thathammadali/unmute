'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import socket from '@/lib/socket';
import Cookies from 'js-cookie';

export default function Landing() {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');

    const router = useRouter();

    useEffect(() => {
        if (socket.connected) {
            socket.disconnect();
        }
    }, []);

    const goToRoom = () => {
        Cookies.set('username', username);
        router.push('/room/' + roomId);
    };

    const handleKeyDown = async (e: string) => {
        if (e === 'Enter') {
            goToRoom();
        }
    };

    const handleClick = () => goToRoom();

    return (
        <div className="flex h-[100vh] w-[100vw] items-center justify-center">
            <div className="flex w-[50%] flex-col gap-2">
                <h1 className={'mx-auto mb-12 text-5xl'}>Unmute</h1>
                <input
                    className="h-12 rounded-3xl border border-gray-300 p-3"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e.key)}
                />
                <input
                    className="h-12 rounded-3xl border border-gray-300 p-3"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e.key)}
                />
                <button
                    className="h-12 rounded-3xl bg-blue-300 hover:cursor-pointer hover:bg-blue-500"
                    onClick={handleClick}
                >
                    Join
                </button>
            </div>
        </div>
    );
}
