import { useEffect, useRef } from 'react';

interface PresenterProps {
    screen: MediaStream | null;
}

export default function Presenter({ screen }: PresenterProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && screen) {
            videoRef.current.srcObject = screen;
        } else {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, [screen]);

    return (
        <>
            {screen && (
                <div className={'h-[calc(100%-300px)] w-full'}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={'aspect-video flex-1'}
                    />
                </div>
            )}
        </>
    );
}
