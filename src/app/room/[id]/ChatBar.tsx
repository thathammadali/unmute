import { useEffect, useState } from 'react';
import { ActionButton } from '@/app/room/[id]/Buttons';
import { BiSend } from 'react-icons/bi';
import socket from '@/lib/socket';

interface IMessage {
    sender: string;
    message: string;
}

export function ChatBar() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<IMessage>>([]);

    useEffect(() => {
        const handleReceiveMessage = (message: IMessage) => {
            setMessages((prev) => {
                const updated = [...prev, message];
                console.log(updated);
                return updated;
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

            <div className={'flex flex-col justify-start'}>
                {messages.length === 0 ? (
                    <p>Nothing to display</p>
                ) : (
                    messages.map((message, index) => (
                        <Message
                            key={index}
                            sender={message.sender}
                            message={message.message}
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

function Message({ sender, message }: IMessage) {
    return (
        <div className={'flex flex-col gap-2 rounded-xl bg-blue-400'}>
            <h2>{sender}</h2>
            <p>{message}</p>
        </div>
    );
}
