# LLM Backend SDK
LLM Backend SDK is a library that simplifies integration of Large Language Models (LLMs) into your backend services.

## Change Log
| Version | Changes |
|---------|---------|
| v0.0.1  | API for fetching models, chat completion/streaming, and image generation |

## Features
- `getModels`: Retrieves a list of available language models from configured providers with their capabilities and metadata
- `getCompletion`: Sends prompts to LLMs and returns full text responses, supporting various parameters for controlling generation
- `streamCompletion`: Delivers LLM responses as they're being generated in real-time, enabling progressive rendering in client applications
- `generateImage`: Creates images from text prompts using AI image generation models, with customizable parameters for style and quality


## Installation
```bash
npm install @innobridge/llmbackendsdk
```

In you backend application
```typescript
import { api } from "@innobridge/llmbackendsdk";


const models = await api.getModels(<baseUrl>, <apiKey>);
```

# Database

## Installation
Install postgresql
```bash
npm install pg @types/pg 
```
in your applecation's main file where you start your express server.

i.e. `index.js`
```typescript
import { databaseApi, databaseConfiguration } from '@innobridge/llmbackendsdk';
const app = express();
...

const config = {
    connectionString: <your database url>
} as databaseConfiguration.PostgresConfiguration;

if (<your env is production>) {
    config.ssl = {
        rejectUnauthorized: true
    };
}

initializeDatabase(
    config
).then(() => {
    const server = app.listen(+port, () => {
        console.log(`Listening on http://localhost:${port}`);
        console.log(`Swagger UI: http://localhost:${port}/docs`);
    });
  
    // Handle server shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        console.log('Server closed. Closing database...');
        await shutdownDatabase();
        process.exit(0);
      });
    };
  
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  });
  ```

  ## Running migrations
  in `index.js`
  ```typescript
  import { databaseApi, databaseConfiguration } from '@innobridge/llmbackendsdk';
  import { PoolClient } from 'pg';

  ...
  const config = {
    connectionString: <your database url>
} as databaseConfiguration.PostgresConfiguration;

if (<your env is production>) {
    config.ssl = {
        rejectUnauthorized: true
    };
}

const migration: Map<number, (client: PoolClient) => Promise<void>> = new Map();
migration.set(1, async (client: PoolClient) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP
        );
    `);
});
migration.set(2, async (client: PoolClient) => {
    await client.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(255);
    `);
});

initializeDatabase(
    config,
    migration
).then(() => {
    const server = app.listen(+port, () => {
        console.log(`Listening on http://localhost:${port}`);
        console.log(`Swagger UI: http://localhost:${port}/docs`);
    });
  
    // Handle server shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        console.log('Server closed. Closing database...');
        await shutdownDatabase();
        process.exit(0);
      });
    };
  
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  });
  ```