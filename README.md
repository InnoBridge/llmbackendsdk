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
```
npm install @innobridge/llmbackendsdk
```

In you backend application
```
import { api } from @innobridge/llmbackendsdk


const models = await api.getModels(<baseUrl>, <apiKey>);
```