import { Ref, useEffect, useRef, useState } from 'react';
import { ActionButton } from '@/app/room/[id]/Buttons';
import { BiSend } from 'react-icons/bi';
import socket from '@/lib/socket';

interface IMessage {
    sender: string | null;
    message: string;
    time: string;
}

interface SocketMessage {
    sender_id: string;
    sender_name: string;
    message: string;
    time: string;
}

export function ChatBar() {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<Array<IMessage>>([]);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleReceiveMessage = (message: SocketMessage) => {
            setMessages((prev: Array<IMessage>) => {
                const isOwn = message.sender_id === socket.id;

                const newMessage = {
                    sender: isOwn ? null : message.sender_name,
                    message: message.message,
                    time: message.time,
                };

                return [...prev, newMessage];
            });
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (text === '' || text.trim() === '') {
            return;
        }

        const time = new Date().toLocaleTimeString('en-US', { hour12: true });
        const message = {
            message: text,
            time: time,
        };

        socket.emit('send-message', message);
        setText('');
    };

    const handleKeyDown = (key: string) => {
        if (key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div
            className={
                'flex h-[calc(100vh-10rem)] w-100 flex-col items-center overflow-y-hidden rounded-l-2xl bg-white p-2 transition-all duration-300'
            }
        >
            <h1>Chat</h1>
            <hr className={'my-2 w-full'} />

            <MessageContainer messages={messages} bottomRef={bottomRef} />

            <div className={'flex w-full gap-2'}>
                <input
                    className={'h-12 w-full rounded-lg bg-blue-300 p-2'}
                    placeholder={'Type here...'}
                    autoComplete={'off'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e.key)}
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

function MessageContainer({
    messages,
    bottomRef,
}: {
    messages: IMessage[];
    bottomRef: Ref<HTMLDivElement>;
}) {
    return (
        <div
            className={
                'my-2 flex h-full w-full flex-1 flex-col justify-start gap-2 overflow-y-auto'
            }
        >
            {messages.map((message, index) => (
                <Message
                    key={index}
                    sender={message.sender}
                    message={message.message}
                    time={message.time}
                />
            ))}
            <div ref={bottomRef}></div>
        </div>
    );
}

function Message({ sender, message, time }: IMessage) {
    return (
        <div
            className={`flex w-full ${sender ? 'justify-start' : 'justify-end'}`}
        >
            <div
                className={`flex w-[90%] flex-col gap-2 rounded-xl p-2 ${sender ? 'bg-blue-300' : 'bg-gray-300'}`}
            >
                {sender && <h2 className={'font-bold'}>{sender}</h2>}
                <p>{message}</p>
                <p className={'ml-auto text-neutral-500'}>{time}</p>
            </div>
        </div>
    );
}
