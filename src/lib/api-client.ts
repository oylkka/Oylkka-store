import axios from 'axios';

const apiClient = axios.create({
  timeout: 30_000,
});

function dispatchUnauthorized(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      dispatchUnauthorized();
      return Promise.reject(error);
    }

    if (!error.response) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
