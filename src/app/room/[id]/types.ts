export interface IMessage {
    type: string;
    sender: string | null;
    message: string;
    time: string;
}
