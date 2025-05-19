import { Chat, Message } from '@/models/storage/dto';
import { PoolClient, QueryResult } from 'pg';

interface DatabaseClient {
    queryWithClient(client: PoolClient, text: string, params?: any[]): Promise<QueryResult>;
    query(query: string, params?: any[]): Promise<any>;
    registerMigration(fromVersion: number, migrationFn: (client: PoolClient) => Promise<void>): void
    initializeDatabase(): Promise<void>;
    countChatsByUserId(userId: string, updatedAfter?: number): Promise<number>;
    addChat(chatId: number, title: string, userId: string, updatedAt: number, deletedAt?: number): Promise<void>;
    addChats(chats: Chat[]): Promise<void>;
    getChatsByUserId(userId: string, updatedAfter?: number, limit?: number, page?: number): Promise<Chat[]>;
    syncChats(chatsToSync: Chat[], chatsToDelete: number[]): Promise<void>;
    countMessagesByUserId(userId: string, updatedAfter?: number): Promise<number>;
    addMessage(
        messageId: number, 
        chatId: number, 
        content: string, 
        role: string,
        createdAt: number,
        imageUrl?: string, 
        prompt?: string): Promise<void>;
    addMessages(messages: Message[]): Promise<void>;
    getMessagesByChatIds(chatIds: number[]): Promise<any[]>;
    getMessagesByUserId(userId: string, updatedAfter?: number, limit?: number, page?: number): Promise<any[]>;
    renameChat(chatId: number, title: string, updatedAt: number): Promise<void>;
    deleteChat(chatId: number): Promise<void>;
    shutdown(): Promise<void>;
};

export {
    DatabaseClient,
}