import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Contact API
export const contactAPI = {
  getAll: (params = {}) => axios.get(`${API_URL}/api/contacts`, { ...getAuthHeaders(), params }),
  
  getOne: (id) => axios.get(`${API_URL}/api/contacts/${id}`, getAuthHeaders()),
  
  create: (data) => axios.post(`${API_URL}/api/contacts`, data, getAuthHeaders()),
  
  update: (id, data) => axios.put(`${API_URL}/api/contacts/${id}`, data, getAuthHeaders()),
  
  delete: (id) => axios.delete(`${API_URL}/api/contacts/${id}`, getAuthHeaders()),
  
  importJSON: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/api/contacts/import/json`, formData, getAuthHeaders());
  },
  
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/api/contacts/import/csv`, formData, getAuthHeaders());
  },
  
  exportJSON: () => axios.get(`${API_URL}/api/contacts/export/json`, {
    ...getAuthHeaders(),
    responseType: 'blob'
  }),
  
  exportCSV: () => axios.get(`${API_URL}/api/contacts/export/csv`, {
    ...getAuthHeaders(),
    responseType: 'blob'
  })
};

// Category API
export const categoryAPI = {
  getAll: () => axios.get(`${API_URL}/api/categories`, getAuthHeaders()),
  
  create: (name, color) => axios.post(`${API_URL}/api/categories`, null, {
    ...getAuthHeaders(),
    params: { name, color }
  }),
  
  delete: (id) => axios.delete(`${API_URL}/api/categories/${id}`, getAuthHeaders())
};

// File upload API
export const uploadAPI = {
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/api/upload-profile-picture`, formData, getAuthHeaders());
  }
};

// Stats API
export const statsAPI = {
  get: () => axios.get(`${API_URL}/api/stats`, getAuthHeaders())
};
