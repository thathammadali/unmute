import Bar from '@/app/room/[id]/Bar';
import { useEffect, useState } from 'react';

interface MembersBarProps {
    isVisible: boolean;
}

export function MembersBar({ isVisible }: MembersBarProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    return (
        <Bar isVisible={isVisible} isReady={isReady} invertedTransform={true}>
            <h1>Members</h1>
        </Bar>
    );
}
