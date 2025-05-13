import { ToolType } from "@/models/enums";

interface ToolCall {
    function: FunctionCall;
    id: string;
    type: ToolType;
};

interface FunctionCall {
    arguments: string;
    name: string;
};

export {
    ToolCall,
    FunctionCall
};