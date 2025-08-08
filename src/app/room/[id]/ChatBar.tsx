import { useEffect, useState } from 'react';
import { ActionButton } from '@/app/room/[id]/Buttons';
import { BiSend } from 'react-icons/bi';
import socket from '@/lib/socket';

interface IMessage {
    sender: string | null;
    message: string;
    color: string;
}

interface SocketMessage {
    sender_id: string;
    sender_name: string;
    message: string;
}

export function ChatBar() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<IMessage>>([]);

    useEffect(() => {
        const handleReceiveMessage = (message: SocketMessage) => {
            setMessages((prev: Array<IMessage>) => {
                const isOwn = message.sender_id === socket.id;

                const newMessage = {
                    sender:  isOwn ? null : message.sender_name,
                    message: message.message,
                    color: isOwn ? 'gray-300' : 'blue-300'
                }

                return [...prev, newMessage];
            });
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
        };
    }, []);

    const sendMessage = () => {
        socket.emit('send-message', message);
    };

    return (
        <div
            className={
                'flex h-full w-100 flex-col items-center rounded-l-2xl bg-white p-2 transition-all duration-300'
            }
        >
            <h1>Chat</h1>
            <hr className={'my-2 w-full flex-1'} />

            <div className={'my-2 flex w-full gap-2 flex-col justify-start'}>
                {(
                    messages.map((message, index) => (
                        <Message
                            key={index}
                            sender={message.sender}
                            message={message.message}
                            color={message.color}
                        />
                    ))
                )}
            </div>

            <div className={'flex w-full gap-2'}>
                <input
                    className={'h-12 w-full rounded-lg bg-blue-300 p-2'}
                    placeholder={'Type here...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <ActionButton
                    icon={<BiSend />}
                    onClickHandler={sendMessage}
                    color={'oklch(70.7% 0.165 254.624)'}
                />
            </div>
        </div>
    );
}

function Message({ sender, message, color }: IMessage) {
    return (
        <div className={`flex w-full ${sender ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-2 flex w-[90%] flex-col gap-2 rounded-xl bg-${color}`}>
                {sender && <h2 className={"font-bold"}>{sender}</h2>}
                <p>{message}</p>
            </div>
        </div>
    );
}
