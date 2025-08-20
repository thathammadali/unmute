import { Ref, useEffect, useRef, useState } from 'react';
import { ActionButton } from '@/app/room/[id]/Buttons';
import { BiSend } from 'react-icons/bi';
import socket from '@/lib/socket';
import Bar from '@/app/room/[id]/Bar';

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

interface ChatBarProps {
    isVisible: boolean;
    isReady: boolean;
    setIsReady: Function;
}

export function ChatBar({ isVisible, isReady, setIsReady }: ChatBarProps) {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<Array<IMessage>>([]);
    const [newMessages, setNewMessages] = useState<IMessage[]>([]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const isVisibleRef = useRef<boolean>(isVisible);

    useEffect(() => {
        const onMessagesFetched = (messages: SocketMessage[]) => {
            setNewMessages(
                messages.map((message) => {
                    const isOwn = message.sender_id === socket.id;

                    return {
                        sender: isOwn ? null : message.sender_name,
                        message: message.message,
                        time: message.time,
                    };
                })
            );

            requestAnimationFrame(() => {
                setIsReady(true);
            });
        };

        const handleReceiveMessage = (message: SocketMessage) => {
            const isOwn = message.sender_id === socket.id;

            const newMessage = {
                sender: isOwn ? null : message.sender_name,
                message: message.message,
                time: message.time,
            };

            if (isVisibleRef.current) {
                setMessages((prev) => [...prev, newMessage]);
            } else {
                setNewMessages((prev) => [...prev, newMessage]);
            }
        };

        const handleUserJoined = (username: string) => {
            setMessages((prev: Array<IMessage>) => {
                const notification = {
                    sender: null,
                    message: username,
                    time: new Date().toLocaleTimeString(),
                };

                return [...prev, notification];
            });
        };

        socket.emit('fetch-messages');
        socket.on('messages-fetched', onMessagesFetched);
        socket.on('receive-message', handleReceiveMessage);
        socket.on('user-joined-notif', handleUserJoined);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
            socket.off('messages-fetched', onMessagesFetched);
            socket.off('user-joined-notif', handleUserJoined);
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isVisible) {
            setMessages((prev) => [...prev, ...newMessages]);
            setNewMessages([]);
        }
        isVisibleRef.current = isVisible;
    }, [isVisible]);

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
        <Bar isVisible={isVisible} isReady={isReady}>
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
        </Bar>
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
