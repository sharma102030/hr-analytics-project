import axios from 'axios';

// In dev this reads from frontend/.env (VITE_API_URL=http://localhost:5000/api).
// When you deploy, set VITE_API_URL on Render/Vercel to your live backend URL + /api.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({ baseURL });

export default apiClient;
