import { 
    ToolType,
    ComparisonOperator,
    CompoundOperator,
    SearchContextSize
} from '@/models/enums';

interface ToolChoice {
    function: Function;
    type: ToolType.FUNCTION;
};

type Tool = 
    | FileSearchTool
    | FunctionTool
    | WebSearchTool
    | ComputerUseTool;

interface FileSearchTool {
    type: ToolType.FILE_SEARCH;
    vector_store_ids: Array<string>;
    filters?: Filter;
};

interface FunctionTool {
    function: Function
    type: ToolType.FUNCTION;
};

interface WebSearchTool {
    type: ToolType.WEB_SEARCH_PREVIEW | ToolType.WEB_SEARCH_PREVIEW_2025_03_11;
    search_context_size: SearchContextSize;
    user_location: UserLocation | null;
}

interface ComputerUseTool {
    display_height: number;
    display_width: number;
    environment: string;
    type: ToolType.COMPUTER_USE_PREVIEW;
};

interface Function {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean | null;
};

type Filter = 
    | ComparisonFilter 
    | CompoundFilter 
    | null;

interface ComparisonFilter {
    key: string;
    type: ComparisonOperator;
    value: string | number | boolean;
};

interface CompoundFilter {
    filters: Array<Filter>;
    type: CompoundOperator;
}

interface UserLocation {
    type: 'approximate';
    city: string | null;
    country: string | null;
    region: string | null;
    latitude: number | null;
}

export {
    ToolChoice,
    Tool,
    FileSearchTool,
    FunctionTool,
    WebSearchTool,
    ComputerUseTool,
    Function,
    Filter,
    ComparisonFilter,
    CompoundFilter,
    UserLocation
};