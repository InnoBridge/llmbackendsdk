import { ResponseFormat } from "@/models/enums";

interface ResponseFormatText {
    type: ResponseFormat.TEXT;
};

interface ResponseFormatJSONObject {
    type: ResponseFormat.JSON_OBJECT;
};

interface ResponseFormatJSONSchema {
    json_schema: JSONSchema;
    type: ResponseFormat.JSON_SCHEMA;
};

interface JSONSchema {
        name: string;
        description?: string;
        schema?: Record<string, unknown>;
        strict?: boolean | null;
};

export {
    JSONSchema,
    ResponseFormatText,
    ResponseFormatJSONObject,
    ResponseFormatJSONSchema
};