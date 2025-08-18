'use client';
import { useEffect, useState } from 'react';
import socket from '@/lib/socket';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { MembersBar } from '@/app/room/[id]/MembersBar';
import { ChatBar } from '@/app/room/[id]/ChatBar';
import { BottomBar } from './BottomBar';
import TopBar from '@/app/room/[id]/TopBar';
import Presenter from './Presenter';

interface User {
    id: string;
    username: string;
}

export default function RoomClient({ roomId }: { roomId: string }) {
    const [members, setMembers] = useState<Array<string>>([]);

    // Connection States
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isJoined, setIsJoined] = useState(false);

    // Bars Visibility States
    const [isMembersBarVisible, setIsMembersBarVisible] = useState(false);
    const [isChatBarVisible, setIsChatBarVisible] = useState(false);

    // Bars Ready States
    const [isMembersBarReady, setIsMembersBarReady] = useState(false);
    const [isChatBarReady, setIsChatBarReady] = useState(false);

    // Media States
    const [screen, setScreen] = useState<MediaStream | null>(null);

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
            {isJoined && (!isMembersBarReady || !isChatBarReady) && (
                <div
                    className={
                        'absolute flex h-screen w-screen items-center justify-center bg-white'
                    }
                >
                    <h1>Preparing the room...</h1>
                </div>
            )}

            <TopBar roomId={roomId} />

            <div className={'flex w-full flex-1 overflow-x-hidden'}>
                <MembersBar
                    members={members}
                    isVisible={isMembersBarVisible}
                    isReady={isMembersBarReady}
                    setIsReady={setIsMembersBarReady}
                />
                <div className={'flex flex-1 flex-col'}>
                    <Presenter screen={screen} />
                    <MembersSection members={members} />
                </div>
                <ChatBar
                    isVisible={isChatBarVisible}
                    isReady={isChatBarReady}
                    setIsReady={setIsChatBarReady}
                />
            </div>

            <BottomBar
                setIsMembersBarVisible={setIsMembersBarVisible}
                setIsChatBarVisible={setIsChatBarVisible}
                setScreen={setScreen}
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

function MembersSection({ members }: { members: string[] }) {
    let grid_rows;
    let grid_cols;

    if (members.length === 1) {
        grid_rows = 1;
        grid_cols = 1;
    } else if (members.length === 2) {
        grid_rows = 1;
        grid_cols = 2;
    } else {
        const x = Math.ceil(Math.sqrt(members.length));
        grid_rows = x;
        grid_cols = x;
    }

    return (
        <div
            className={`grid h-full w-full gap-2 px-4 transition-all duration-300 ease-in-out`}
            style={{
                gridTemplateColumns: `repeat(${grid_cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${grid_rows}, minmax(0, 1fr))`,
            }}
        >
            {members.map((member, index) => (
                <MemberCard key={index} username={member} />
            ))}
        </div>
    );
}
