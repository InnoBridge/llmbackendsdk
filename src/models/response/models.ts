import { ResponseObject } from "@/models/enums";

interface Model {
    /**
     * The model identifier, which can be referenced in the API endpoints.
     */
    id: string;

    /**
     * The Unix timestamp (in seconds) when the model was created.
     */
    created?: number;

    /**
     * The object type, which is always "model".
     */
    object?: ResponseObject.MODEL;

    /**
     * The organization that owns the model.
     */
    owned_by?: string;
}

/**
 * Response structure for the model list API call
 */
interface Models {
    /**
     * Array of model objects
     */
    data: Model[];
    
    /**
     * The object type, which is always "list"
     */
    object: ResponseObject.LIST;
}

export {
    Model,
    Models
}