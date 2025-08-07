import RoomClient from '@/app/room/[id]/client';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function Home({ params }: Props) {
    const { id } = await params;

    return <RoomClient roomId={id} />;
}
