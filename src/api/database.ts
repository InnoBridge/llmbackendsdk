import { DatabaseClient } from '@/storage/persistent/database_client';
import { PostgresClient } from '@/storage/persistent/postgres_client';
import { DatabaseConfiguration } from '@/models/storage/configuration';
import { Chat, Message } from '@/models/storage/dto';
import { PoolClient } from 'pg';

let databaseClient: DatabaseClient | null = null;

const initializeDatabase = async (
    config: DatabaseConfiguration,
    registerMigrations?: Map<number, (client: PoolClient) => Promise<void>> 
): Promise<void> => {
    databaseClient = new PostgresClient(config);
    if (registerMigrations) {
        registerMigrations.forEach((migration, version) => {
            databaseClient?.registerMigration(version, migration);
        });
    }
    await databaseClient.initializeDatabase();
};

const isDatabaseClientSet = (): boolean => {
    return databaseClient !== null;
};

const queryWithClient = async (client: PoolClient, query: string, params?: any[]): Promise<any> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await databaseClient?.queryWithClient(client, query, params);
};

const query = async (query: string, params?: any[]): Promise<any> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await databaseClient?.query(query, params);
};

const countChatsByUserId = async (userId: string, updatedAfter?: number, excludeDeleted?: boolean): Promise<number> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await databaseClient!.countChatsByUserId(userId, updatedAfter, excludeDeleted);
};

const addChat = async (chatId: string, title: string, userId: string, updatedAt: number, createdAt?: number, deletedAt?: number): Promise<void> => {  
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    await databaseClient?.addChat(chatId, title, userId, updatedAt, createdAt, deletedAt);
};

const addChats = async (chats: Chat[]): Promise<void> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    await databaseClient?.addChats(chats);
}

const getChatsByUserId = async (userId: string, updatedAfter?: number, limit?: number, page?: number, excludeDeleted?: boolean): Promise<Chat[]> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await databaseClient!.getChatsByUserId(userId, updatedAfter, limit, page, excludeDeleted);
};

const syncChats = async (userId: string, chats: Chat[], updatedAt?: number): Promise<void> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    if (!chats || chats.length === 0) {
        return;
    }
    const chatsToSync: Chat[] = [];
    const chatsToDelete: string[] = [];
    
    const dbChats = await databaseClient?.getChatsByUserId(userId, updatedAt);
    const dbChatsMap = new Map(dbChats?.map(chat => [chat.chatId, chat]));

    /**
     * 1. If chat doesn't exist in database then it will be upserted
     * to database. If the chat has deletedAt then it will be 
     * added chatsToDelete list.
     * 2. We want to check if the userId in chat matches the userId
     * in the argument. If it doesn't match log an error and skip.
     * 3. If the chat from database has deletedAt skip.
     * 4. If the chat from database has no deletedAt and the chat
     * from argument has deletedAt then add to chatsToSync and
     * chatsToDelete list.
     * 5. If the chat from database has no deletedAt and the chat
     * from argument has no deletedAt then check if the updatedAt
     * is greater than the chat from database. If it is then
     * add to chatsToSync list.
     */
    chats.forEach(chat => {
        // Add this check for requirement #2
        if (chat.userId !== userId) {
            console.error(`Chat ${chat.chatId} has userId ${chat.userId} which doesn't match the provided userId ${userId}`);
            return; // Skip this chat
        }

        const dbChat = dbChatsMap.get(chat.chatId);
        if (dbChat) {
            if (!dbChat.deletedAt) {
                if (chat.deletedAt) {
                    chatsToSync.push(chat);
                    chatsToDelete.push(chat.chatId);
                } else if (chat.updatedAt > dbChat.updatedAt) {
                    chatsToSync.push(chat);
                }
            }
        } else {
            chatsToSync.push(chat);
            if (chat.deletedAt) {
                chatsToDelete.push(chat.chatId);
            }
        }
    });

    await databaseClient?.syncChats(chatsToSync, chatsToDelete);
}

const countMessagesByUserId = async (userId: string, createdAfter?: number, excludeDeleted?: boolean): Promise<number> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await databaseClient!.countMessagesByUserId(userId, createdAfter, excludeDeleted);
};

const addMessage = async (
    messageId: string, 
    chatId: string, 
    content: string, 
    role: string,
    createdAt: number,
    imageUrl?: string, 
    prompt?: string): Promise<void> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    await databaseClient?.addMessage(messageId, chatId, content, role, createdAt, imageUrl, prompt);
};

const getMessagesByChatIds = async (chatIds: string[]): Promise<any[]> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await databaseClient!.getMessagesByChatIds(chatIds);
};

const getMessagesByUserId = async (userId: string, createdAfter?: number, limit?: number, page?: number, excludeDeleted?: boolean): Promise<Message[]> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await databaseClient!.getMessagesByUserId(userId, createdAfter, limit, page, excludeDeleted);
};

/**
 * Add messages in bulk, skips messages that already exist in the database
 * @param messages - array of messages to be added to the database
 * @returns 
 */
const addMessages = async (messages: Message[]): Promise<void> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    await databaseClient?.addMessages(messages);
}

const renameChat = async (chatId: string, title: string, updatedAt: number): Promise<void> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    await databaseClient?.renameChat(chatId, title, updatedAt);
};

const deleteChat = async (chatId: string): Promise<void> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    await databaseClient?.deleteChat(chatId);
};

const shutdownDatabase = async (): Promise<void> => {
    if (isDatabaseClientSet()) {
        await databaseClient?.shutdown();
    }
};

export {
    initializeDatabase,
    query,
    queryWithClient,
    countChatsByUserId,
    addChat,
    addChats,
    getChatsByUserId,
    syncChats,
    countMessagesByUserId,
    addMessage,
    getMessagesByChatIds,
    getMessagesByUserId,
    addMessages,
    renameChat,
    deleteChat,
    shutdownDatabase
};