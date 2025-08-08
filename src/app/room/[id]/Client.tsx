'use client';
import { useEffect, useState } from 'react';
import socket from '@/lib/socket';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { MembersBar } from '@/app/room/[id]/MembersBar';
import { ChatBar } from '@/app/room/[id]/ChatBar';
import { BottomBar } from './BottomBar';

interface User {
    id: string;
    username: string;
}

export default function RoomClient({ roomId }: { roomId: string }) {
    const [users, setUsers] = useState<Array<string>>([]);

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const [isMembersBarVisible, setIsMembersBarVisible] = useState(false);
    const [isChatBarVisible, setIsChatBarVisible] = useState(false);

    const router = useRouter();

    const joinRoom = () => {
        const username = Cookies.get('username');
        console.log('Joining room:', roomId, username);
        if (!username || !roomId) router.push('/');
        setIsConnecting(false);
        setIsConnected(true);
        socket.emit('join-room', username, roomId);
    };

    const connect = () => {
        if (!socket.connected) {
            setIsConnecting(true);
            socket.connect();
        }
    };

    useEffect(() => {
        connect();

        const onConnect = () => {
            console.log('Connected to room');
            joinRoom();
        };

        const onRoomJoined = () => {
            setIsJoined(true);
        };

        socket.emit('prepare-room', roomId);

        const receiveUserList = (users: User[]) => {
            setUsers(users.map((user) => user.username));
        };

        socket.on('connect', onConnect);
        socket.on('room-joined', onRoomJoined);
        socket.on('user-joined', receiveUserList);
        socket.on('refresh-users', receiveUserList);

        return () => {
            socket.off('prepare-room', receiveUserList);
            socket.off('user-joined', receiveUserList);
            socket.off('refresh-users', receiveUserList);
            socket.off('connect', onConnect);
            socket.off('room-joined', onRoomJoined);
        };
    }, []);

    if (isConnecting)
        return <h1>Establishing a connection to the server...</h1>;
    if (isConnected && !isJoined) return <h1>Joining the specified room...</h1>;

    const gridSize = Math.ceil(Math.sqrt(users.length));
    const colClass = `grid-cols-${gridSize}`;
    const rowClass = `grid-rows-${gridSize}`;

    return (
        <div className={'flex h-screen flex-col bg-neutral-600'}>
            <div
                className={
                    'flex h-20 w-full items-center justify-center bg-neutral-600 text-white'
                }
            >
                {roomId}
            </div>

            <div className={'flex w-full flex-1'}>
                {isMembersBarVisible && <MembersBar />}
                <div
                    className={`grid transition-all duration-150 ease-in-out ${colClass} ${rowClass} flex-1 gap-2 px-4`}
                >
                    {users.map((user, index) => (
                        <UserCard key={index} username={user} />
                    ))}
                </div>
                {isChatBarVisible && <ChatBar />}
            </div>

            <BottomBar
                setIsMembersBarVisible={setIsMembersBarVisible}
                setIsChatBarVisible={setIsChatBarVisible}
            />
        </div>
    );
}

function UserCard({ username }: { username: string }) {
    return (
        <div
            className={
                'flex items-center justify-center rounded-3xl bg-blue-300'
            }
        >
            <h2 className={'text-9xl'}>{username[0]}</h2>
        </div>
    );
}
