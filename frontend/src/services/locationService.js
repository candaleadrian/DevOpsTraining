import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl() ?? '';

export const setLocation = async (latitude, longitude, radius) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/set-location`, {
      latitude,
      longitude,
      radius,
    });
    return response.data;
  } catch (error) {
    console.error('Error setting location:', error);
    throw error;
  }
};

export const checkLocation = async (latitude, longitude) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/check-location`, {
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking location:', error);
    throw error;
  }
};