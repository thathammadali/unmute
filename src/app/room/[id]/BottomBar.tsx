import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionButton, ToggleButton } from '@/app/room/[id]/Buttons';
import { BsChat, BsPerson } from 'react-icons/bs';
import { CiMicrophoneOff, CiMicrophoneOn } from 'react-icons/ci';
import { MdCallEnd, MdOutlinePresentToAll } from 'react-icons/md';

interface BottomBarProps {
    setIsMembersBarVisible: Function;
    setIsChatBarVisible: Function;
    setScreen: Function;
}

export function BottomBar({
    setIsMembersBarVisible,
    setIsChatBarVisible,
    setScreen,
}: BottomBarProps) {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isScreenOn, setIsScreenOn] = useState(false);

    const toggleMic = () => {
        setIsMicOn((pv) => !pv);
    };

    const toggleScreen = async () => {
        if (isScreenOn) {
            setIsScreenOn(false);
            setScreen(null);
        } else {
            setScreen(
                await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                })
            );
            setIsScreenOn(true);
        }
    };

    const router = useRouter();

    const leaveRoom = () => {
        router.push('/');
    };

    return (
        <div className={'flex h-20 bg-neutral-600'}>
            <div className={'flex h-full w-20 items-center justify-center'}>
                <ActionButton
                    icon={<BsPerson />}
                    onClickHandler={() =>
                        setIsMembersBarVisible((pv: boolean) => !pv)
                    }
                />
            </div>

            <div
                className={
                    'flex h-full w-full flex-1 items-center justify-center gap-2'
                }
            >
                <ToggleButton
                    offIcon={<CiMicrophoneOff />}
                    onIcon={<CiMicrophoneOn />}
                    isOn={isMicOn}
                    onClickHandler={toggleMic}
                />

                <ActionButton
                    icon={<MdOutlinePresentToAll />}
                    onClickHandler={toggleScreen}
                />
                <ActionButton
                    icon={<MdCallEnd />}
                    color={'red'}
                    onClickHandler={leaveRoom}
                />
            </div>

            <div className={'flex h-full w-20 items-center justify-center'}>
                <ActionButton
                    icon={<BsChat />}
                    onClickHandler={() =>
                        setIsChatBarVisible((pv: boolean) => !pv)
                    }
                />
            </div>
        </div>
    );
}
