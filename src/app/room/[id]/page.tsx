import RoomClient from '@/app/room/[id]/client';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Room ${(await params).id}`,
    };
}

export default async function Home({ params }: Props) {
    const { id } = await params;

    return <RoomClient roomId={id} />;
}
