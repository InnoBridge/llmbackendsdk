import { Chat, Message } from '@/models/storage/dto';
import { PoolClient, QueryResult } from 'pg';

interface DatabaseClient {
    queryWithClient(client: PoolClient, text: string, params?: any[]): Promise<QueryResult>;
    query(query: string, params?: any[]): Promise<any>;
    registerMigration(fromVersion: number, migrationFn: (client: PoolClient) => Promise<void>): void
    initializeDatabase(): Promise<void>;
    countChatsByUserId(userId: string, updatedAfter?: number, excludeDeleted?: boolean): Promise<number>;
    addChat(chatId: string, title: string, userId: string, updatedAt: number, createdAt?:number, deletedAt?: number): Promise<void>;
    addChats(chats: Chat[]): Promise<void>;
    getChatsByUserId(userId: string, updatedAfter?: number, limit?: number, page?: number, excludeDeleted?: boolean): Promise<Chat[]>;
    syncChats(chatsToSync: Chat[], chatsToDelete: string[]): Promise<void>;
    countMessagesByUserId(userId: string, createdAfter?: number, excludeDeleted?: boolean): Promise<number>;
    addMessage(
        messageId: string, 
        chatId: string, 
        content: string, 
        role: string,
        createdAt: number,
        imageUrl?: string, 
        prompt?: string): Promise<void>;
    addMessages(messages: Message[]): Promise<void>;
    getMessagesByChatIds(chatIds: string[]): Promise<Message[]>;
    getMessagesByUserId(userId: string, createdAfter?: number, limit?: number, page?: number, excludeDeleted?: boolean): Promise<Message[]>;
    renameChat(chatId: string, title: string, updatedAt: number): Promise<void>;
    deleteChat(chatId: string): Promise<void>;
    shutdown(): Promise<void>;
};

export {
    DatabaseClient,
}