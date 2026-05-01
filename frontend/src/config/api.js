const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getApiUrl = (path = '') => `${API_BASE_URL}${path}`;
export const getAssetUrl = (path = '') => `${API_BASE_URL}${path}`;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL;

export default API_BASE_URL;
