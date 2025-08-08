import { ActionButton } from '@/app/room/[id]/Buttons';
import { BiClipboard } from 'react-icons/bi';

export default function TopBar({ roomId }: { roomId: string }) {
    const copyToClipBoard = async () => {
        await navigator.clipboard.writeText(roomId);
        alert('Room ID copied to clipboard!');
    };

    return (
        <div
            className={
                'flex h-20 w-full items-center justify-center gap-2 bg-neutral-600 text-white'
            }
        >
            <h2>{roomId}</h2>
            <ActionButton
                icon={<BiClipboard />}
                onClickHandler={copyToClipBoard}
            />
        </div>
    );
}
