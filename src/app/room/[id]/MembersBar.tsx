import Bar from '@/app/room/[id]/Bar';
import { useEffect } from 'react';

interface MembersBarProps {
    isVisible: boolean;
    isReady: boolean;
    setIsReady: Function;
}

export function MembersBar({ isVisible, isReady, setIsReady }: MembersBarProps) {

    useEffect(() => {
        requestAnimationFrame(()=>{
            setIsReady(true);
        })
    }, []);

    return (
        <Bar isVisible={isVisible} isReady={isReady} invertedTransform={true}>
            <h1>Members</h1>
        </Bar>
    );
}
