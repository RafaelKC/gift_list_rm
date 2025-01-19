import axios from 'axios';
import { Gift, GiftCreate, UpdateSelector } from '../types/gift';
import ProductDetails from "@/types/produc-datails";

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
  getAvailableGifts: async (): Promise<Gift[]> => {
    const response = await api.get('/gifts');
    return response.data;
  },

  getAllGifts: async (): Promise<Gift[]> => {
    const response = await api.get('/gifts/all');
    return response.data;
  },

  getGiftsBySelector: async (selectorEmail: string): Promise<Gift[]> => {
    const response = await api.get(`/gifts/selector/${selectorEmail}`);
    return response.data;
  },

  createGift: async (gift: GiftCreate): Promise<Gift> => {
    const response = await api.post('/gifts', gift);
    return response.data;
  },

  updateSelector: async (giftId: string, update: UpdateSelector): Promise<Gift> => {
    const response = await api.patch(`/gifts/${giftId}/selector`, update);
    return response.data;
  },

  deleteGift: async (giftId: string): Promise<void> => {
    await api.delete(`/gifts/${giftId}`);
  },

  getProductsDetails: async (productUrl: string): Promise<ProductDetails | null> => {
    const response = await api.get(`/products?product_url=${productUrl}`);
    if (response.status !== 200) return null;
    return response.data;
  }
};
