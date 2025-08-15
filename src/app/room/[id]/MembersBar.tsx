import Bar from '@/app/room/[id]/Bar';
import { useEffect } from 'react';

interface MembersBarProps {
    members: string[];
    isVisible: boolean;
    isReady: boolean;
    setIsReady: Function;
}

export function MembersBar({ members, isVisible, isReady, setIsReady }: MembersBarProps) {

    useEffect(() => {
        requestAnimationFrame(()=>{
            setIsReady(true);
        })
    }, []);

    return (
        <Bar isVisible={isVisible} isReady={isReady} invertedTransform={true}>
            <h1>Members</h1>
            <hr className={'my-2 w-full'}/>

            <ul>
                {members.map((member, index) => <li key={index}>
                    <p className={"text-center"}>{member}</p>
                </li>)}
            </ul>
        </Bar>
    );
}
