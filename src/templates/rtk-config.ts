export const RTK_CONFIG_TEMPLATE = `import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

// Utility pour invalider les tags conditionnellement
export const invalidateOn = <T>(
  { success, error }: { success?: T[]; error?: T[] }
) => {
  return (result: unknown, _error: unknown, _arg: unknown) => 
    result ? (success ?? []) : (error ?? []);
};

// Configuration du baseQuery
const getBaseQuery = () =>
  fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: async (headers) => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      
      if (token) {
        headers.set("Authorization", \`Bearer \${token}\`);
      }
      
      return headers;
    },
  });

// Classe pour gérer les erreurs de réponse
export class ResponseError<InFields extends string = string> extends Error {
  private readonly globalError?: string;
  private readonly fieldsErrors?: Record<InFields, string>;

  constructor(
    { status, data }: FetchBaseQueryError
  ) {
    super();
    
    switch (status) {
      case "TIMEOUT_ERROR":
        this.globalError = "Request timed out. Please try again.";
        break;
      case "FETCH_ERROR":
        this.globalError = "Cannot reach out to the server. Please try again.";
        break;
      case "PARSING_ERROR":
        this.globalError = "Error parsing server response.";
        break;
      default:
        if (data && typeof data === 'object') {
          const responseData = data as { message?: string; errors?: Record<InFields, string> };
          this.globalError = responseData.message || "Something went wrong. Please try again.";
          this.fieldsErrors = responseData.errors;
        } else {
          this.globalError = "Something went wrong. Please try again.";
        }
        break;
    }
  }

  export<OutFields extends string = InFields>(
    fieldsMap?: Partial<Record<InFields, OutFields>>
  ) {
    return {
      message: this.globalError,
      errors:
        fieldsMap && this.fieldsErrors
          ? Object.keys(this.fieldsErrors).reduce(
              (acc, key) => ({
                ...acc,
                [fieldsMap[key as InFields] || key]: this.fieldsErrors![key as InFields],
              }),
              {} as Record<string, string>
            )
          : this.fieldsErrors || {},
    };
  }
}

// Clé pour extraire le body de la réponse
export const RESPONSE_BODY_KEY = "data";

// Instance de l'API
export const apiInstance = createApi({
  reducerPath: 'api',
  tagTypes: [
    "Auth",
    "Users",
    // Add your tag types here
  ],
  baseQuery: getBaseQuery(),
  endpoints: () => ({}),
});

export { getBaseQuery };
`;