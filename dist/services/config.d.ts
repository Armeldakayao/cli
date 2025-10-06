import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
export declare const invalidateOn: <T>({ success, error }: {
    success?: T[];
    error?: T[];
}) => (result: unknown, _error: unknown, _arg: unknown) => T[];
declare const getBaseQuery: () => any;
export declare class ResponseError<InFields extends string = string> extends Error {
    private readonly globalError?;
    private readonly fieldsErrors?;
    constructor({ status, data }: FetchBaseQueryError);
    export<OutFields extends string = InFields>(fieldsMap?: Partial<Record<InFields, OutFields>>): {
        message: string | undefined;
        errors: Record<InFields, string>;
    };
}
export declare const RESPONSE_BODY_KEY = "data";
export declare const apiInstance: any;
export { getBaseQuery };
//# sourceMappingURL=config.d.ts.map