import { 
    ImageSize,
    ImageBackground,
    ImageModeration,
    ImageQuality,
    ImageFormat,
    ImageStyle
} from "@/models/enums";

interface GenerateImageRequest {
    model?: string | null;
    prompt: string;
    n?: number | null;
    size?: ImageSize | null;
    background?: ImageBackground | null;
    moderation?: ImageModeration | null;
    output_compression?: number | null;
    quality?: ImageQuality | null;
    response_format?: ImageFormat | null;
    style?: ImageStyle | null;
    user?: string | null;
};

export {
    GenerateImageRequest
};