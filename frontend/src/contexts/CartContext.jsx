// src/contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Logger } from '../utils/helpers';

/**
 * Shopping Cart Context for managing cart state and operations
 */
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
        Logger.info('Cart loaded from localStorage');
      } catch (error) {
        Logger.error('Failed to load cart from storage:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Add item to cart
   */
  const addToCart = (meal, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === meal.id);
      
      let newItems;
      if (existingItem) {
        // Update quantity if item already exists
        newItems = prevItems.map(item =>
          item.id === meal.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        Logger.info(`Updated quantity for "${meal.name}" to ${existingItem.quantity + quantity}`);
      } else {
        // Add new item to cart
        newItems = [...prevItems, { ...meal, quantity }];
        Logger.info(`Added "${meal.name}" to cart with quantity ${quantity}`);
      }
      
      return newItems;
    });
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (mealId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.id === mealId);
      const newItems = prevItems.filter(item => item.id !== mealId);
      
      if (item) {
        Logger.info(`Removed "${item.name}" from cart`);
      }
      
      return newItems;
    });
  };

  /**
   * Update item quantity in cart
   */
  const updateQuantity = (mealId, quantity) => {
    if (quantity < 1) {
      removeFromCart(mealId);
      return;
    }

    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === mealId ? { ...item, quantity } : item
      );
      
      const item = newItems.find(item => item.id === mealId);
      if (item) {
        Logger.info(`Updated quantity for "${item.name}" to ${quantity}`);
      }
      
      return newItems;
    });
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    Logger.info('Cart cleared');
    setCartItems([]);
  };

  /**
   * Calculate total items in cart
   */
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Calculate total price of cart
   */
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  /**
   * Toggle cart visibility
   */
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  /**
   * Open cart
   */
  const openCart = () => {
    setIsCartOpen(true);
  };

  /**
   * Close cart
   */
  const closeCart = () => {
    setIsCartOpen(false);
  };

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    toggleCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};