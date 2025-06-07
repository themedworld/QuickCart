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
  const [productStocks, setProductStocks] = useState({});

  // Fonction pour récupérer le stock actuel d'un produit
  const fetchProductStock = async (productId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products/${productId}?consumer_key=${process.env.NEXT_PUBLIC_WC_CONSUMER_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET}`
      );
      
      if (!response.ok) throw new Error('Erreur de récupération du stock');
      
      const product = await response.json();
      return product.stock_quantity;
    } catch (error) {
      console.error("Erreur lors de la récupération du stock:", error);
      return null;
    }
  };

  // Mettre à jour les stocks des produits dans le panier
  const updateProductStocks = async () => {
    const stocks = {};
    for (const productId in cartItems) {
      const stock = await fetchProductStock(productId);
      stocks[productId] = stock;
    }
    setProductStocks(stocks);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product) => {
    // Vérifier le stock avant d'ajouter au panier
    const currentStock = await fetchProductStock(product.id);
    
    if (currentStock !== null && currentStock <= 0) {
      alert("Ce produit n'est plus disponible en stock");
      return;
    }

    setCartItems(prevItems => {
      const newItems = { ...prevItems };
      const productId = product.id.toString();
      const currentQuantity = newItems[productId]?.quantity || 0;

      // Vérifier si la quantité demandée dépasse le stock
      if (currentStock !== null && (currentQuantity + 1) > currentStock) {
        alert(`Désolé, nous n'avons que ${currentStock} unité(s) disponible(s) pour ce produit.`);
        return prevItems;
      }

      newItems[productId] = newItems[productId]
        ? { ...newItems[productId], quantity: newItems[productId].quantity + 1 }
        : { product, quantity: 1, price: product.price };

      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }

      return newItems;
    });
  };

  const updateCartQuantity = async (productId, quantity) => {
    // Vérifier le stock avant de mettre à jour la quantité
    const currentStock = await fetchProductStock(productId);
    
    setCartItems(prevItems => {
      const newItems = { ...prevItems };
      const productIdStr = productId.toString();
      const productItem = newItems[productIdStr];
      
      if (!productItem) return prevItems;

      // Vérifier le stock seulement si on augmente la quantité
      if (quantity > productItem.quantity && currentStock !== null && quantity > currentStock) {
        alert(`Désolé, nous n'avons que ${currentStock} unité(s) disponible(s) pour ce produit.`);
        return prevItems;
      }

      if (quantity <= 0) {
        delete newItems[productIdStr];
      } else {
        newItems[productIdStr] = { ...productItem, quantity };
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

  // Mettre à jour les stocks quand le panier change
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      updateProductStocks();
    }
  }, [cartItems]);

  const value = {
    currency,
    router,
    products,
    isLoading,
    userData: user,
    isAuthenticated,
    isShopManager: user?.roles?.includes('shop_manager') || false,
    cartItems,
    productStocks,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartCount,
    getCartAmount,
    clearCart,
    fetchData,
    fetchProductStock, // Exposer pour utilisation dans les composants enfants
  };


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
