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

        return () => {
            socket.off("prepare-room", receiveUserList);
            socket.off("user-joined", receiveUserList);
        }
    }, []);



    if (isLoading) {
        return <h1>Loading the room...</h1>
    }

    return <div>
        <ul>
            {users.map((user, index) => (
                <li key={index}>{user}</li>
            ))}
        </ul>
    </div>
}
