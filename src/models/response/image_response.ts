import { ImageUsage } from '@/models/response/usage';

interface ImageResponse {
    created: number;
    data: Array<Image>;
    usage?: ImageUsage;
}

interface Image {
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
};

export {
    ImageResponse,
    Image,
};