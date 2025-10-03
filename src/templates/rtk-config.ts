// export const RTK_CONFIG_TEMPLATE = `import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

// export const invalidateOn = <T>({ success, error }: { success?: T[]; error?: T[] }) => {
//   return (result: unknown) => (result ? (success ?? []) : (error ?? []));
// };

// const getBaseQuery = () =>
//   fetchBaseQuery({
//     baseUrl: process.env.NEXT_PUBLIC_API_URL,
//     prepareHeaders: async (headers) => {
//       const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
//       if (!headers.has("Content-Type")) {
//         headers.set("Content-Type", "application/json");
//       }

//       if (token) {
//         headers.set("Authorization", \`Bearer \${token}\`);
//       }

//       return headers;
//     },
//   });

// export class ResponseError<InFields extends string> extends Error {
//   constructor(
//     { status, data }: FetchBaseQueryError,
//     private readonly globalError?: string,
//     private readonly fieldsErrors?: Record<InFields, string>
//   ) {
//     super();
//     switch (status) {
//       case "TIMEOUT_ERROR":
//         this.globalError = "Request timed out. Please try again.";
//         break;
//       case "FETCH_ERROR":
//         this.globalError = "Cannot reach out to the server. Please try again.";
//         break;
//       default:
//         if (data) {
//           this.globalError = (data as { message?: string; errors?: Record<InFields, string> }).message;
//           this.fieldsErrors = (data as { message?: string; errors?: Record<InFields, string> }).errors;
//         } else {
//           this.globalError = "Something went wrong. Please try again.";
//         }
//         break;
//     }
//   }

//   export<OutFields extends string>(fieldsMap?: Partial<Record<InFields, OutFields>>) {
//     return {
//       message: this.globalError,
//       errors:
//         fieldsMap && this.fieldsErrors
//           ? Object.keys(this.fieldsErrors).reduce(
//               (acc, key) => ({
//                 ...acc,
//                 [fieldsMap[key as InFields]]: this.fieldsErrors![key as InFields],
//               }),
//               {}
//             )
//           : {},
//     };
//   }
// }

// export const RESPONSE_BODY_KEY = "data";

// export const apiInstance = createApi({
//   tagTypes: [
//     "Auth",
//     "Users",
//     // Add your tag types here
//   ],
//   baseQuery: getBaseQuery(),
//   endpoints: () => ({}),
// });

// export { getBaseQuery };
// `;




export const RTK_CONFIG_TEMPLATE = `import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

export const invalidateOn = <T>({ success, error }: { success?: T[]; error?: T[] }) => {
  return (result: unknown) => (result ? (success ?? []) : (error ?? []));
};

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

export class ResponseError<InFields extends string> extends Error {
  constructor(
    { status, data }: FetchBaseQueryError,
    private readonly globalError?: string,
    private readonly fieldsErrors?: Record<InFields, string>
  ) {
    super();
    switch (status) {
      case "TIMEOUT_ERROR":
        this.globalError = "Request timed out. Please try again.";
        break;
      case "FETCH_ERROR":
        this.globalError = "Cannot reach out to the server. Please try again.";
        break;
      default:
        if (data) {
          this.globalError = (data as { message?: string; errors?: Record<InFields, string> }).message;
          this.fieldsErrors = (data as { message?: string; errors?: Record<InFields, string> }).errors;
        } else {
          this.globalError = "Something went wrong. Please try again.";
        }
        break;
    }
  }

  export<OutFields extends string>(fieldsMap?: Partial<Record<InFields, OutFields>>) {
    return {
      message: this.globalError,
      errors:
        fieldsMap && this.fieldsErrors
          ? Object.keys(this.fieldsErrors).reduce(
              (acc, key) => ({
                ...acc,
                [fieldsMap[key as InFields]]: this.fieldsErrors![key as InFields],
              }),
              {}
            )
          : {},
    };
  }
}

export const RESPONSE_BODY_KEY = "data";

export const apiInstance = createApi({
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