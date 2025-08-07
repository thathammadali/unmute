'use client';
import { useState, useEffect } from 'react';
import socket from '@/lib/socket';
import { MdCallEnd, MdOutlinePresentToAll } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { CiMicrophoneOff, CiVideoOff } from 'react-icons/ci';
import { BsChat, BsPerson } from 'react-icons/bs';

export default function RoomClient({ roomId }: { roomId: string }) {
    const [users, setUsers] = useState<Array<string>>([]);

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const [isMembersBarVisible, setIsMembersBarVisible] = useState(false);
    const [isChatBarVisible, setIsChatBarVisible] = useState(false);

    const joinRoom = () => {
        const username = 'Someone Here';
        console.log('Here:', roomId, username);
        if (!username || !roomId) return;
        setIsConnecting(false);
        setIsConnected(true);
        console.log('Joining room:', roomId, username);
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

        const receiveUserList = (users: Array<string>) => {
            setUsers(users);
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

function BottomBar(Props: {
    setIsMembersBarVisible: Function;
    setIsChatBarVisible: Function;
}) {
    const { setIsMembersBarVisible, setIsChatBarVisible } = Props;

    const router = useRouter();

    const leaveRoom = () => {
        router.push('/');
    };

    return (
        <div className={'flex h-20 bg-neutral-600'}>
            <div className={'flex h-full w-20 items-center justify-center'}>
                <BsPerson
                    className={'rounded-full border-2 p-1 hover:cursor-pointer'}
                    size={35}
                    color={'white'}
                    onClick={() => setIsMembersBarVisible((pv: boolean) => !pv)}
                />
            </div>

            <div
                className={
                    'flex h-full w-full flex-1 items-center justify-center gap-2'
                }
            >
                <CiMicrophoneOff
                    className={'rounded-full border-2 p-1 hover:cursor-pointer'}
                    size={35}
                    color={'white'}
                />
                <CiVideoOff
                    className={'rounded-full border-2 p-1 hover:cursor-pointer'}
                    size={35}
                    color={'white'}
                />
                <MdOutlinePresentToAll
                    className={'rounded-full border-2 p-1 hover:cursor-pointer'}
                    size={35}
                    color={'white'}
                />
                <MdCallEnd
                    className={'rounded-full border-2 p-1 hover:cursor-pointer'}
                    size={35}
                    color={'red'}
                    onClick={leaveRoom}
                />
            </div>

            <div className={'flex h-full w-20 items-center justify-center'}>
                <BsChat
                    className={'rounded-full border-2 p-1 hover:cursor-pointer'}
                    size={35}
                    color={'white'}
                    onClick={() => setIsChatBarVisible((pv: boolean) => !pv)}
                />
            </div>
        </div>
    );
}

function MembersBar() {
    return (
        <div
            className={
                'flex h-full w-50 justify-center rounded-r-2xl bg-white p-2 transition-all duration-300'
            }
        >
            People here
        </div>
    );
}

function ChatBar() {
    return (
        <div
            className={
                'flex h-full w-50 justify-center rounded-l-2xl bg-white p-2 transition-all duration-300'
            }
        >
            Chat here
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
