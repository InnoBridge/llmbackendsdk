interface Chat {
    chatId: string;
    title: string;
    userId: string;
    updatedAt: number;
    createdAt?: number;
    deletedAt?: number;
};

interface Message {
    messageId: string;
    chatId: string;
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