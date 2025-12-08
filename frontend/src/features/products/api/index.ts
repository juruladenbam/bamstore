import client from '../../../api/client';
import type { Product } from '../types';

export const getProducts = async (search?: string): Promise<Product[]> => {
  const url = search ? `/products?search=${encodeURIComponent(search)}` : '/products';
  const response = await client.get(url);
  return response.data;
};

export const getProduct = async (slugOrId: string): Promise<Product> => {
  const response = await client.get(`/products/${slugOrId}`);
  return response.data;
};
