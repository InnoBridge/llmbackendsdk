type Usage = 
    | CompletionUsage
    | ImageUsage
    | EmbeddingUsage;

interface CompletionUsage {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens_details?: CompletionTokensDetails | null; 
    prompt_tokens_details?: PromptTokensDetails | null;
};

interface CompletionTokensDetails {
    accepted_prediction_tokens: number;
    audio_tokens: number;
    reasoning_tokens: number;
    rejected_prediction_tokens: number;
}

interface PromptTokensDetails {
    audio_tokens: number;
    cached_tokens: number;
}

interface ImageUsage {
    input: number;
    input_tokens_details: InputTokensDetails | null;
    output_tokens: number;
    total_tokens: number;
};

interface InputTokensDetails {
    image_tokens: number;
    text_tokens: number;
};

interface EmbeddingUsage {
    prompt_tokens: number;
    total_tokens: number;
};

export {
    Usage,
    CompletionUsage,
    ImageUsage,
    EmbeddingUsage,
    CompletionTokensDetails,
    PromptTokensDetails,
    InputTokensDetails
}