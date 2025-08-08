'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import socket from '@/lib/socket';
import Cookies from 'js-cookie';
import { FaRandom } from 'react-icons/fa';

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
        if (!username || !roomId) {
            alert('Please enter a username and room id');
            return;
        }
        Cookies.set('username', username);
        router.push('/room/' + roomId);
    };

    const handleKeyDown = async (e: string) => {
        if (e === 'Enter') {
            goToRoom();
        }
    };

    const generateRandomID = async () => {
        try {
            const id = await (
                await fetch('http://localhost:3001/generate-room')
            ).text();
            setRoomId(id);
        } catch (err) {
            console.log(err);
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
                    title={'The name that will be displayed in the room'}
                />
                <div
                    className={'flex w-full items-center justify-center gap-2'}
                >
                    <input
                        className="h-12 w-full rounded-3xl border border-gray-300 p-3"
                        placeholder="Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e.key)}
                        maxLength={8}
                        title={
                            "The ID of the room you're trying to join. If the room doesn't exist, it will be created"
                        }
                    />
                    <FaRandom
                        size={30}
                        className={'hover:cursor-pointer'}
                        title={'Generate random ID'}
                        onClick={generateRandomID}
                    />
                </div>
                <button
                    className="h-12 rounded-3xl bg-blue-300 select-none hover:cursor-pointer hover:bg-blue-500"
                    onClick={handleClick}
                >
                    Join
                </button>
            </div>
        </div>
    );
}
