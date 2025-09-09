import { types as mediasoupTypes } from 'mediasoup';

export interface Room {
    peers: string[]; // array of socket IDs
    messages: SocketMessage[];
    router: mediasoupTypes.Router;
    transports: Record<string, mediasoupTypes.WebRtcTransport>; // key = socket.id
    producers: Record<string, mediasoupTypes.Producer>; // key = socket.id (or track id)
    consumers: Record<string, mediasoupTypes.Consumer>; // key = socket.id
}

export interface SocketMessage {
    sender_id: string;
    sender_name: string;
    message: string;
    time: string;
}

export interface Rooms {
    [roomId: string]: Room;
}
