import { ToolCall } from "@/models/response/tool_call";

interface Message {
    role: string;
    content: string | null;
    refusal?: string | null;
    annotations?: Array<Annotation> | null;
    audio?: Array<Audio> | null;
    tool_calls?: Array<ToolCall> | null;
};

interface Annotation {
    type: string;
    url_citation: Url_Citation;
};

interface Url_Citation {
    end_index: number;
    start_index: number;
    title: string;
    url: string;
};

interface Audio {
    data: string;
    expires_at: string;
    id: string;
    model: string;
};

export {
    Message,
    Annotation,
    Url_Citation,
    Audio
};