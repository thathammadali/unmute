import socket from '@/lib/socket';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function Home({ params }: Props) {
    const { id } = await params;

    return (
        <div>
            <h1>Room ID: {id}</h1>
        </div>
    );
}
