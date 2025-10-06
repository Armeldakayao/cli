"use strict";
// export const FETCH_UTILS_TEMPLATE = `const getAuthHeaders = () => {
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     return token ? { 'Authorization': \`Bearer \${token}\` } : {};
//   };
//   `;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FETCH_UTILS_TEMPLATE = void 0;
exports.FETCH_UTILS_TEMPLATE = `const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { 'Authorization': \`Bearer \${token}\` } : {};
};
`;
//# sourceMappingURL=fetch-utils.js.map