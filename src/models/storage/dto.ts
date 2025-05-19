interface Chat {
    chatId: number;
    title: string;
    userId: string;
    updatedAt: number;
    deletedAt?: number;
};

interface Message {
    messageId: number;
    chatId: number;
    content: string;
    role: string;
    createdAt: number;
    imageUrl?: string;
    prompt?: string;
};

export {
    Chat,
    Message
};