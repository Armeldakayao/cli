"use strict";
// export const AXIOS_CONFIG_TEMPLATE = `import axios from 'axios';
Object.defineProperty(exports, "__esModule", { value: true });
exports.AXIOS_CONFIG_TEMPLATE = void 0;
// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = \`Bearer \${token}\`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('authToken');
//     }
//     return Promise.reject(error);
//   }
// );
// export default api;
// `;
exports.AXIOS_CONFIG_TEMPLATE = `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;
`;
//# sourceMappingURL=axios-config.js.map