'use client';
import { useEffect, useState } from 'react';
import socket from '@/lib/socket';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { MembersBar } from '@/app/room/[id]/MembersBar';
import { ChatBar } from '@/app/room/[id]/ChatBar';
import { BottomBar } from './BottomBar';
import TopBar from '@/app/room/[id]/TopBar';

interface User {
    id: string;
    username: string;
}

export default function RoomClient({ roomId }: { roomId: string }) {
    const [members, setMembers] = useState<Array<string>>([]);

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isJoined, setIsJoined] = useState(false);

    const [isMembersBarVisible, setIsMembersBarVisible] = useState(false);
    const [isChatBarVisible, setIsChatBarVisible] = useState(false);

    const [isMembersBarReady, setIsMembersBarReady] = useState(false);
    const [isChatBarReady, setIsChatBarReady] = useState(false);

    const router = useRouter();

    const joinRoom = () => {
        const username = Cookies.get('username');
        setIsConnecting(false);
        setIsConnected(true);
        socket.emit('join-room', username, roomId);
    };

    const connect = () => {
        const username = Cookies.get('username');
        if (!username || !roomId) {
            alert('Please enter a valid username and room id');
            router.push('/');
            return;
        }

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
            setMembers(users.map((user) => user.username));
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
        return (
            <div
                className={'flex h-screen w-screen items-center justify-center'}
            >
                <h1>Establishing a connection to the server...</h1>
            </div>
        );
    if (isConnected && !isJoined)
        return (
            <div
                className={'flex h-screen w-screen items-center justify-center'}
            >
                <h1>Joining the specified room...</h1>
            </div>
        );

    return (
        <div className={'flex h-screen w-screen flex-col bg-neutral-600'}>
            {/*Show a cover until all components are ready*/}
            {(isJoined && (!isMembersBarReady || !isChatBarReady)) && (<div
            className={'absolute bg-white flex h-screen w-screen items-center justify-center'}
        >
            <h1>Preparing the room...</h1>
        </div>)}

            <TopBar roomId={roomId} />

            <div className={'flex w-full flex-1 overflow-x-hidden'}>
                <MembersBar isVisible={isMembersBarVisible} isReady={isMembersBarReady} setIsReady={setIsMembersBarReady} />
                <MembersSection members={members} />
                <ChatBar isVisible={isChatBarVisible} isReady={isChatBarReady} setIsReady={setIsChatBarReady} />
            </div>

            <BottomBar
                setIsMembersBarVisible={setIsMembersBarVisible}
                setIsChatBarVisible={setIsChatBarVisible}
            />
        </div>
    );
}

function MemberCard({ username }: { username: string }) {
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

function MembersSection({members}: {members: string[]}) {
    return <div
        className={`grid transition-all duration-150 ease-in-out flex-1 gap-2 px-4`}
    >
        {members.map((member, index) => (
            <MemberCard key={index} username={member}/>
        ))}
    </div>
}