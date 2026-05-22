import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create();

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
