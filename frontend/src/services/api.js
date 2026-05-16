import axios from 'axios';

// Use cloud backend if configured (Vercel), otherwise default to the local PC's IP (LAN mode)
const host = window.location.hostname;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${host}:8080`;

const API_BASE_URL = `${BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadFile = async (file, sharingMode, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sharingMode', sharingMode);

  const response = await apiClient.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

export const getFileDetails = async (id) => {
  const response = await apiClient.get(`/file/${id}`);
  return response.data;
};

export const getDevices = async () => {
  const response = await apiClient.get('/devices');
  return response.data;
};

export const getDownloadUrl = (id) => {
  return `${API_BASE_URL}/file/download/${id}`;
};

export const getFrontendDownloadUrl = (id) => {
  return `${window.location.protocol}//${window.location.host}/download/${id}`;
};

export const getWebSocketUrl = () => {
  return `${BASE_URL}/ws`;
};
