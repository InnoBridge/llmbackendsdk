import { 
    ResponseObject,
    FinishReason,
    ServiceTeir
} from "@/models/enums";
import { LogProbs } from "@/models/response/log_prob";
import { Message } from "@/models/response/message";
import { Usage } from "@/models/response/usage";

interface ChatCompletion {
    id: string;
    object: ResponseObject.COMPLETION | ResponseObject.CHAT_COMPLETION_CHUNK;
    created: number;
    model: string;
    system_fingerprint?: string;
    choices: Array<CompletionChoice>;
    usage: Usage;
    service_teir?: ServiceTeir | null;
};

type CompletionChoice = 
    | CompletionMessage
    | CompletionChunk;

interface CompletionMessage {
    index: number;
    message: Message;
    finished_reason: FinishReason; 
    logprobs?: LogProbs | null;
};

interface CompletionChunk {
    index: number;
    delta: Message;
    finished_reason: FinishReason; 
    logprobs?: LogProbs | null;
};

export {
    ChatCompletion,
    CompletionChoice,
    CompletionMessage,
    CompletionChunk
};