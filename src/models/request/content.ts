import {
    ContentType,
} from "@/models/enums";

interface TextContent {
    text: string;
    type: ContentType.TEXT;
};

interface RefusalContent {
    refusal: string;
    type: ContentType.REFUSAL;
};

interface PredictionContent {
    content: string | Array<TextContent>;
    type: ContentType.CONTENT;
};

export {
    TextContent,
    RefusalContent,
    PredictionContent,
}