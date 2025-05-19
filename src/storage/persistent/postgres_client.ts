import { Pool, PoolClient, QueryResult } from 'pg';
import { DatabaseClient } from '@/storage/persistent/database_client';
import {
    CREATE_VERSION_TABLE_QUERY,
    GET_SCHEMA_VERSION_QUERY,
    UPDATE_SCHEMA_VERSION_QUERY,
    CREATE_CHATS_TABLE_QUERY,
    CREATE_MESSAGES_TABLE_QUERY,
    INDEX_CHATS,
    INDEX_MESSAGES,
    COUNT_CHATS_BY_USER_ID_QUERY,
    ADD_CHAT_QUERY,
    ADD_CHATS_QUERY,
    GET_CHATS_BY_USER_ID_QUERY,
    COUNT_MESSAGES_BY_USER_ID_QUERY,
    ADD_MESSAGE_QUERY,
    ADD_MESSAGES_QUERY,
    GET_MESSAGES_BY_CHAT_IDS_QUERY,
    RENAME_CHAT_QUERY,
    DELETE_CHAT_QUERY,
    GET_MESSAGES_BY_USER_ID_QUERY,
    UPSERT_CHATS_QUERY,
    DELETE_MESSAGES_BY_CHAT_IDS
} from '@/storage/queries';
import { Chat, Message } from '@/models/storage/dto';
import { PostgresConfiguration } from '@/models/storage/configuration';

class PostgresClient implements DatabaseClient {
    private pool: Pool;
    // Add to PostgresClient class
    private migrations: Map<number, (client: PoolClient) => Promise<void>> = new Map();

    constructor(config: PostgresConfiguration) {
        this.pool = new Pool(config);

        // Register default migrations
        this.registerMigration(0, async (client) => {
            await this.createChatsTable(client);
            await this.createMessagesTable(client);
            await this.queryWithClient(client, INDEX_CHATS);
            await this.queryWithClient(client, INDEX_MESSAGES);
        });
    }

    async query(text: string, params?: any[]): Promise<QueryResult> {
        const client = await this.pool.connect();
        try {
            return await client.query(text, params);
        } finally {
            client.release();
        }
    }

    async queryWithClient(client: PoolClient, text: string, params?: any[]): Promise<QueryResult>  {
        return await client.query(text, params);
    }

    async createChatsTable(client: PoolClient): Promise<void> {
        await this.queryWithClient(client, CREATE_CHATS_TABLE_QUERY);
    }

    async createMessagesTable(client: PoolClient): Promise<void> {
        await this.queryWithClient(client, CREATE_MESSAGES_TABLE_QUERY);
    }

    // Public method to register migrations
    registerMigration(fromVersion: number, migrationFn: (client: PoolClient) => Promise<void>): void {
        this.migrations.set(fromVersion, migrationFn);
    }

    // Update initializeDatabase to use registered migrations
    async initializeDatabase(): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            await this.queryWithClient(client, CREATE_VERSION_TABLE_QUERY);
            const versionResult = await this.queryWithClient(client, GET_SCHEMA_VERSION_QUERY);
            let currentVersion = versionResult.rows[0].version;
            
            // Apply migrations in order
            while (this.migrations.has(currentVersion)) {
                console.log(`Upgrading from version ${currentVersion} to ${currentVersion + 1}`);
                const migration = await this.migrations.get(currentVersion);
                await migration!(client);
                currentVersion++;
                await this.queryWithClient(client, UPDATE_SCHEMA_VERSION_QUERY, [currentVersion]);
            }
            
            console.log(`Database schema is at version ${currentVersion}`);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database initialization failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async countChatsByUserId(userId: string, updatedAfter?: number): Promise<number> {
        const result = await this.query(COUNT_CHATS_BY_USER_ID_QUERY, [userId, updatedAfter || null]);
        return parseInt(result.rows[0].total, 10);
    }

    async addChat(chatId: number, title: string, userId: string, updatedAt: number, deletedAt?: number): Promise<void> {
        await this.query(ADD_CHAT_QUERY, [chatId, userId, title, updatedAt, deletedAt || null]);
    }

    async addChats(chats: Chat[]): Promise<void> {
        if (chats.length === 0) {
            return;
        }
        
        const chatIds = [];
        const userIds = [];
        const titles = [];
        const updatedAts = [];
        const deletedAts = [];
        
        for (const chat of chats) {
            chatIds.push(chat.chatId);
            userIds.push(chat.userId);
            titles.push(chat.title);
            updatedAts.push(chat.updatedAt);  // Pass as numeric value
            deletedAts.push(chat.deletedAt || null);  // Pass as numeric value or null
        }
        
        await this.query(ADD_CHATS_QUERY, [chatIds, userIds, titles, updatedAts, deletedAts]);
    }

    async getChatsByUserId(userId: string, updatedAfter?: number, limit: number = 20, page: number = 0): Promise<Chat[]> {
        const offset = page * limit;
        const result = await this.query(GET_CHATS_BY_USER_ID_QUERY, [userId, updatedAfter || null, limit, offset]);
     
        return result.rows.map((chat: any) => {
            const chatObject: any = {
                chatId: chat.id,
                userId: chat.user_id,
                title: chat.title,
                updatedAt: chat.updated_at ? Date.parse(chat.updated_at.toISOString()) : null
            };
        
            if (chat.deleted_at) {
                chatObject.deletedAt = new Date(chat.deleted_at).getTime();
            }
            
            return chatObject as Chat;
        });
    };

    /**
     * 
     * @param chatsToSync: chats to upsert to chats table
     * @param chatsToDelete: list of chatIds that we use to delete messages by chatId
     * @returns void
     */
    async syncChats(chatsToSync: Chat[], chatsToDelete: number[]): Promise<void> {
        if (chatsToSync.length === 0 && chatsToDelete.length === 0) {
            return;
        }
        
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            // run queryWithClient to upsert chats in bulk
            if (chatsToSync.length > 0) {
                // Prepare parameters for bulk upsert
                const chatIds = [];
                const userIds = [];
                const titles = [];
                const updatedAts = [];
                const deletedAts = [];
                
                for (const chat of chatsToSync) {
                    chatIds.push(chat.chatId);
                    userIds.push(chat.userId);
                    titles.push(chat.title);
                    updatedAts.push(chat.updatedAt);
                    deletedAts.push(chat.deletedAt || null);
                }
                
                // Perform upsert with transaction client
                await this.queryWithClient(
                    client, 
                    UPSERT_CHATS_QUERY, 
                    [chatIds, userIds, titles, updatedAts, deletedAts]
                );
            }

            if (chatsToDelete.length > 0) {
                // run queryWithClient to delete message by chatid in bulk
                await this.queryWithClient(client, DELETE_MESSAGES_BY_CHAT_IDS, [chatsToDelete]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Chat sync failed:', error);
            throw error;
        } finally {
            client.release();
        }

    }

    async countMessagesByUserId(userId: string, updatedAfter?: number): Promise<number> {
        const result = await this.query(COUNT_MESSAGES_BY_USER_ID_QUERY, [userId, updatedAfter || null]);
        return parseInt(result.rows[0].total, 10);
    };

    async getMessagesByChatIds(chatIds: number[]): Promise<any[]> {
        const result = await this.query(GET_MESSAGES_BY_CHAT_IDS_QUERY, [chatIds]);
        return result.rows;
    }

    async getMessagesByUserId(userId: string, updatedAfter?: number, limit: number = 20, page: number = 0): Promise<any[]> {
        const offset = page * limit;
        return (await this.query(GET_MESSAGES_BY_USER_ID_QUERY, [userId, updatedAfter || null, limit, offset])).rows;
    }

    async addMessage(messageId: number, chatId: number, content: string, role: string, createdAt: number, imageUrl?: string, prompt?: string): Promise<void> {
        await this.query(ADD_MESSAGE_QUERY, [messageId, chatId, content, role, createdAt, imageUrl || null, prompt || null]);
    }

    /**
     * Add messages in bulk, skips messages that already exist in the database
     * @param messages - array of messages to be added to the database
     * @returns 
     */
    async addMessages(messages: Message[]): Promise<void> {
        if (messages.length === 0) {
            return;
        }
        
        const messageIds = [];
        const chatIds = [];
        const contents = [];
        const roles = [];
        const createdAts = [];
        const imageUrls = [];
        const prompts = [];
        
        for (const message of messages) {
            messageIds.push(message.messageId);
            chatIds.push(message.chatId);
            contents.push(message.content);
            roles.push(message.role);
            createdAts.push(message.createdAt);
            imageUrls.push(message.imageUrl || null);
            prompts.push(message.prompt || null);
        }
  
        await this.query(ADD_MESSAGES_QUERY, [messageIds, chatIds, contents, roles, createdAts, imageUrls, prompts]);
    }

    async renameChat(chatId: number, title: string, updatedAt: number): Promise<void> {
        await this.query(RENAME_CHAT_QUERY, [title, updatedAt, chatId]);
    }

    async deleteChat(chatId: number): Promise<void> {
        await this.query(DELETE_CHAT_QUERY, [chatId]);
    }

    async shutdown() {
        await this.pool.end();
    }
}

export {
    PostgresClient,
    PostgresConfiguration
};