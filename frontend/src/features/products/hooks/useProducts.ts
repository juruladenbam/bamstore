import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { getProducts, getProduct } from '../api';

export const useProducts = (searchQuery?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getProducts(searchQuery || undefined)
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err);
        setLoading(false);
      });
  }, [searchQuery]);

  return { products, loading, error };
};

export const useProduct = (slugOrId?: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slugOrId) return;
    setLoading(true);
    getProduct(slugOrId)
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err);
        setLoading(false);
      });
  }, [slugOrId]);

  return { product, loading, error };
};
