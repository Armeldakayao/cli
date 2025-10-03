// export const FETCH_UTILS_TEMPLATE = `const getAuthHeaders = () => {
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     return token ? { 'Authorization': \`Bearer \${token}\` } : {};
//   };
//   `;


export const FETCH_UTILS_TEMPLATE = `const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { 'Authorization': \`Bearer \${token}\` } : {};
};
`;