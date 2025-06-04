'use client'

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children, authData }) => {
  const router = useRouter();
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '$';
  const { isAuthenticated, user, token } = authData || {};

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});

  const fetchData = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };



  const addToCart = (product) => {
    setCartItems(prevItems => {
      const newItems = { ...prevItems };
      const productId = product.id.toString();

      newItems[productId] = newItems[productId]
        ? { ...newItems[productId], quantity: newItems[productId].quantity + 1 }
        : { product, quantity: 1, price: product.price };

      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }

      return newItems;
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCartItems(prevItems => {
      const newItems = { ...prevItems };

      if (quantity <= 0) {
        delete newItems[productId];
      } else {
        newItems[productId] = { ...newItems[productId], quantity };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }

      return newItems;
    });
  };

  const removeFromCart = (productId) => updateCartQuantity(productId, 0);

  const getCartCount = () => Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);

  const getCartAmount = () =>
    Object.values(cartItems)
      .reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);

  const clearCart = () => {
    setCartItems({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  };

  const initializeCart = () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  };

  useEffect(() => {
    initializeCart();
     fetchData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
     fetchData();
    }
  }, [isAuthenticated, token]);

  const value = {
    currency,
    router,
    products,
    isLoading,
    userData: user,
    isAuthenticated,
    isShopManager: user?.roles?.includes('shop_manager') || false,
    cartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartCount,
    getCartAmount,
    clearCart,
    fetchData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
