interface ServerSentEvent {
    id?: string;
    data: string;
    event?: string;
    finished?: boolean;
};

export {
    ServerSentEvent
};