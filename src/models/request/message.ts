import {
    Role,
} from "@/models/enums";
import {
    TextContent,
    RefusalContent,
} from "@/models/request/content";

type Message = 
    | DeveloperMessage
    | SystemMessage 
    | UserMessage 
    | AssistantMessage 
    | ToolMessage
    | FunctionMessage;

interface DeveloperMessage {
    content: string | Array<TextContent>;
    role: Role.DEVELOPER;
    name?: string;
};

interface SystemMessage {
    content: string | Array<TextContent>;
    role: Role.SYSTEM;
    name?: string;
};

interface UserMessage {
    content: string | Array<TextContent>;
    role: Role.USER;
    name?: string;
};

interface AssistantMessage {
    role: Role.ASSISTANT;
    audio?: Audio;
    content?: string 
            | Array<TextContent> 
            | Array<RefusalContent>;
};

interface ToolMessage {
    role: Role.TOOL;
    content: string | Array<TextContent>;
    tool_call_id: string;
};

interface FunctionMessage {
    role: Role.FUNCTION;
    content: string | Array<TextContent>;
    name?: string;
};

interface Audio {
    id: string;
};

export {
    Message,
    DeveloperMessage,
    SystemMessage,
    UserMessage,
    AssistantMessage,
    ToolMessage,
    Audio
}