'use client';
import { useState, useEffect } from 'react';
import socket from "@/lib/socket";

export default function RoomClient({ roomId }: { roomId: string }) {
    const [users, setUsers] = useState<Array<string>>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        socket.emit("prepare-room", roomId);

        const receiveUserList = (users: Array<string>) => {
            setUsers(users);
            setIsLoading(false);
        }

        socket.on("room-prepared", receiveUserList)
        socket.on("user-joined", receiveUserList)
        socket.on('refresh-users', receiveUserList)

        return () => {
            socket.off("prepare-room", receiveUserList);
            socket.off("user-joined", receiveUserList);
            socket.off('refresh-users', receiveUserList);
        }
    }, []);


    if (isLoading) {
        return <h1>Loading the room...</h1>
    }

    const gridSize = Math.ceil(Math.sqrt(users.length));
    const colClass = `grid-cols-${gridSize}`;
    const rowClass = `grid-rows-${gridSize}`;

    return <div className={"flex flex-col h-screen"}>
        <div className={"w-full h-12 flex items-center justify-center text-white bg-neutral-600"}>
            {roomId}
        </div>

        <div className={`transition-all duration-150 ease-in-out grid ${colClass} ${rowClass} h-[100%] w-full flex-1 gap-2 p-4`}>
            {users.map((user, index) => (
                <UserCard key={index} username={user} />
            ))}
        </div>

        <div className={"flex items-center bg-neutral-600 justify-center h-12 w-full"}>
            P
        </div>
    </div>
}

function UserCard({username} : { username: string }) {
    return <div className={'bg-red-600 rounded-xl'}>
        {username}
    </div>
}