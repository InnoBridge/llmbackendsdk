const CREATE_VERSION_TABLE_QUERY = 
    `CREATE TABLE IF NOT EXISTS schema_versions (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

const GET_SCHEMA_VERSION_QUERY = 
    `SELECT COALESCE(MAX(version), 0) as version FROM schema_versions`;

const UPDATE_SCHEMA_VERSION_QUERY = 
    `INSERT INTO schema_versions (version) VALUES ($1)`;

const CREATE_CHATS_TABLE_QUERY = 
    `CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY,
        user_id VARCHAR(255), /* removed REFERENCES users(id) ON DELETE CASCADE */
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT to_timestamp(0) NOT NULL,
        deleted_at TIMESTAMPTZ DEFAULT NULL
    );`;

const CREATE_MESSAGES_TABLE_QUERY =
    `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY,
        chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        role VARCHAR(50) NOT NULL,
        prompt TEXT,
        created_at TIMESTAMPTZ NOT NULL
    );`;

// Add indexes for better performance
const INDEX_CHATS = 
    `CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
     CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at);
     CREATE INDEX IF NOT EXISTS idx_chats_deleted_at ON chats(deleted_at);`;

const INDEX_MESSAGES =
    `CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
     CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`;

const COUNT_CHATS_BY_USER_ID_QUERY = 
    `SELECT COUNT(*) as total 
     FROM chats c 
     WHERE c.user_id = $1
     AND ($2::BIGINT IS NULL OR c.updated_at > to_timestamp($2::BIGINT/1000.0))`;

const GET_CHATS_BY_USER_ID_QUERY = 
    `SELECT c.id, c.user_id, c.title, c.updated_at, c.deleted_at
     FROM chats c 
     WHERE c.user_id = $1
     AND ($2::BIGINT IS NULL OR c.updated_at > to_timestamp($2::BIGINT/1000.0))
     ORDER BY c.updated_at DESC
     LIMIT $3 OFFSET $4;`;

const ADD_CHAT_QUERY = 
    `INSERT INTO chats (id, user_id, title, updated_at, deleted_at)
     VALUES ($1, $2, $3, to_timestamp($4::BIGINT/1000.0), 
            CASE WHEN $5::BIGINT IS NULL THEN NULL ELSE to_timestamp($5::BIGINT/1000.0) END);`;

const ADD_CHATS_QUERY = 
    `INSERT INTO chats (id, user_id, title, updated_at, deleted_at)
     SELECT 
        id, 
        user_id, 
        title, 
        to_timestamp(updated_at::BIGINT/1000.0),
        CASE WHEN deleted_at IS NULL THEN NULL 
             ELSE to_timestamp(deleted_at::BIGINT/1000.0) END
     FROM 
        (SELECT UNNEST($1::integer[]) as id,
                UNNEST($2::varchar[]) as user_id,
                UNNEST($3::varchar[]) as title,
                UNNEST($4::BIGINT[]) as updated_at,
                UNNEST($5::BIGINT[]) as deleted_at);`;

const UPSERT_CHATS_QUERY = 
    `INSERT INTO chats (id, user_id, title, updated_at, deleted_at)
     SELECT 
        id, 
        user_id, 
        title, 
        to_timestamp(updated_at::BIGINT/1000.0),
        CASE WHEN deleted_at IS NULL THEN NULL 
             ELSE to_timestamp(deleted_at::BIGINT/1000.0) END
     FROM 
        (SELECT UNNEST($1::integer[]) as id,
                UNNEST($2::varchar[]) as user_id,
                UNNEST($3::varchar[]) as title,
                UNNEST($4::BIGINT[]) as updated_at,
                UNNEST($5::BIGINT[]) as deleted_at)
     ON CONFLICT (id) 
     DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        title = EXCLUDED.title,
        updated_at = EXCLUDED.updated_at,
        deleted_at = EXCLUDED.deleted_at;`;

const DELETE_MESSAGES_BY_CHAT_IDS = 
    `DELETE FROM messages WHERE chat_id = ANY($1)`;

const RENAME_CHAT_QUERY =
    `UPDATE chats 
     SET title = $1, updated_at = to_timestamp($2::BIGINT/1000.0)
     WHERE id = $3;`;

const DELETE_CHAT_QUERY =
    `DELETE FROM chats WHERE id = $1;`;

const ADD_MESSAGE_QUERY = 
    `INSERT INTO messages (id, chat_id, content, role, created_at, image_url, prompt)
     VALUES ($1, $2, $3, $4, to_timestamp($5::BIGINT/1000.0), $6, $7);`;

const COUNT_MESSAGES_BY_USER_ID_QUERY =
    `SELECT COUNT(*) as total 
     FROM messages m
     JOIN chats c ON m.chat_id = c.id
     WHERE c.user_id = $1
     AND ($2::BIGINT IS NULL OR m.created_at > to_timestamp($2::BIGINT/1000.0))`;


const GET_MESSAGES_BY_CHAT_IDS_QUERY =
    `SELECT id, chat_id, content, role, image_url, prompt, created_at
     FROM messages
     WHERE chat_id = ANY($1)
     ORDER BY created_at ASC;`;

const GET_MESSAGES_BY_USER_ID_QUERY = 
    `SELECT m.id, m.chat_id, m.content, m.role, m.image_url, m.prompt, m.created_at
     FROM messages m
     JOIN chats c ON m.chat_id = c.id
     WHERE c.user_id = $1
     AND ($2::TIMESTAMP IS NULL OR m.created_at > $2)
     ORDER BY m.created_at ASC
     LIMIT $3 OFFSET $4;`;

const ADD_MESSAGES_QUERY =
    `INSERT INTO messages (id, chat_id, content, role, created_at, image_url, prompt)
     SELECT 
        id,
        chat_id,
        content, 
        role,
        to_timestamp(created_at::BIGINT/1000.0),
        image_url,
        prompt
     FROM 
        (SELECT UNNEST($1::integer[]) as id,
                UNNEST($2::integer[]) as chat_id,
                UNNEST($3::text[]) as content,
                UNNEST($4::varchar[]) as role,
                UNNEST($5::BIGINT[]) as created_at,
                UNNEST($6::text[]) as image_url,
                UNNEST($7::text[]) as prompt)
     ON CONFLICT (id) DO NOTHING;`;

export {
    CREATE_VERSION_TABLE_QUERY,
    GET_SCHEMA_VERSION_QUERY,
    UPDATE_SCHEMA_VERSION_QUERY,
    CREATE_CHATS_TABLE_QUERY,
    CREATE_MESSAGES_TABLE_QUERY,
    INDEX_CHATS,
    INDEX_MESSAGES,
    COUNT_CHATS_BY_USER_ID_QUERY,
    GET_CHATS_BY_USER_ID_QUERY,
    RENAME_CHAT_QUERY,
    DELETE_CHAT_QUERY,
    COUNT_MESSAGES_BY_USER_ID_QUERY,
    ADD_CHAT_QUERY,
    ADD_CHATS_QUERY,
    UPSERT_CHATS_QUERY,
    DELETE_MESSAGES_BY_CHAT_IDS,
    ADD_MESSAGE_QUERY,
    GET_MESSAGES_BY_CHAT_IDS_QUERY,
    GET_MESSAGES_BY_USER_ID_QUERY,
    ADD_MESSAGES_QUERY
}