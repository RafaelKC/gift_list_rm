import axios from 'axios';
import { Gift, GiftCreate, UpdateSelector } from '../types/gift';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const giftService = {
  // Get all available gifts (not selected)
  getAvailableGifts: async (): Promise<Gift[]> => {
    const response = await api.get('/gifts');
    return response.data;
  },

  // Get all gifts (including selected ones)
  getAllGifts: async (): Promise<Gift[]> => {
    const response = await api.get('/gifts/all');
    return response.data;
  },

  // Get gifts by selector email
  getGiftsBySelector: async (selectorEmail: string): Promise<Gift[]> => {
    const response = await api.get(`/gifts/selector/${selectorEmail}`);
    return response.data;
  },

  // Create a new gift
  createGift: async (gift: GiftCreate): Promise<Gift> => {
    const response = await api.post('/gifts', gift);
    return response.data;
  },

  // Update selector email for a gift
  updateSelector: async (giftId: string, update: UpdateSelector): Promise<Gift> => {
    const response = await api.patch(`/gifts/${giftId}/selector`, update);
    return response.data;
  },

  // Delete a gift
  deleteGift: async (giftId: string): Promise<void> => {
    await api.delete(`/gifts/${giftId}`);
  },
};
