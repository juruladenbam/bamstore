import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => {
        // Check Product ID
        if (item.product.id !== newItem.product.id) return false;

        // Check Recipient Name
        if (item.recipient_name !== newItem.recipient_name) return false;

        // Check SKU ID
        if (item.sku_id !== newItem.sku_id) return false;

        // Check Variants
        if (item.variants.length !== newItem.variants.length) return false;
        
        const itemVariantIds = item.variants.map(v => v.id).sort((a, b) => a - b);
        const newItemVariantIds = newItem.variants.map(v => v.id).sort((a, b) => a - b);

        return itemVariantIds.every((id, index) => id === newItemVariantIds[index]);
      });

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };
        return updatedItems;
      }

      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => {
    return sum + item.unit_price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
