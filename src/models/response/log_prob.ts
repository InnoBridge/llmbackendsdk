interface LogProbs {
    content?: Array<LogProb> | null;
    refusal?: Array<LogProb> | null;
};

interface LogProb {
    bytes?: Array<number> | null;
    logprob: number;
    token: string;
    top_logprobs?: Array<Record<string, number>> | null;
}

export {
    LogProbs,
    LogProb
}