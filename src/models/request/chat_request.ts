import {
    AudioFormat,
    Modalities,
    ReasoningEffort,
    VoiceFormat,
    ServiceTeir,
    ToolChoice as ToolChoiceEnum,
    SearchContextSize
} from '@/models/enums';
import {
    ResponseFormatText,
    ResponseFormatJSONObject,
    ResponseFormatJSONSchema
} from '@/models/request/response_format';
import {
    Message
} from '@/models/request/message';
import {
    PredictionContent
} from '@/models/request/content';
import {
    ToolChoice,
    Tool
} from '@/models/request/tool';

interface ChatRequest {
    model?: string;
    messages: Array<Message>;
    audio?: Audio | null;
    frequency_penalty?: number | null;
    logit_bias?: Record<string, number> | null;
    logprobs?: boolean | null;
    max_completion_tokens?: number | null;
    metadata?: Record<string, any> | null;
    modalities?: Array<Modalities> | null;
    n?: number | null;
    parallel_tool_calls?: boolean;
    prediction?: PredictionContent | null;
    presence_penalty?: number | null;
    reasoning_effort?: ReasoningEffort | null;
    response_format?: 
        | ResponseFormatText 
        | ResponseFormatJSONObject 
        | ResponseFormatJSONSchema;
    seed?: number | null;
    service_tier?: ServiceTeir | null;
    stop?: string | Array<string> | null;
    store?: boolean | null;
    stream?: boolean | null;
    stream_options?: StreamOptions | null;
    temperature?: number | null;
    tool_choice?: ToolChoiceEnum | ToolChoice;
    tools?: Array<Tool>;
    top_p?: number | null;
    truncation?: string | null;
    user?: string;
    web_search_options?: WebSearchOptions;
};

interface StreamOptions {
    include_usage?: boolean;
};

interface Audio {
    format: AudioFormat;
    voice: string | VoiceFormat;
}

interface WebSearchOptions {
    search_context_size?: SearchContextSize;
    user_location?: UserLocation | null;
};

interface UserLocation {
    approximate: ApproximateUserLocation;
    type: 'approximate';
}

interface ApproximateUserLocation {
    city?: string;
    country?: string;
    region?: string;
    latitude?: number;
};

export {
    ChatRequest,
    Audio,
    WebSearchOptions,
    UserLocation,
    ApproximateUserLocation
};