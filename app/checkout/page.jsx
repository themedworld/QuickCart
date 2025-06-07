'use client';
import { useAppContext } from "@/context/AppContext";
import { useSelector } from 'react-redux';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedPage";

const ConfirmOrderPage = () => {
  const router = useRouter();
  const { cartItems, getCartAmount, currency, clearCart } = useAppContext();
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const items = Object.values(cartItems || {});

  const updateProductStock = async (productId, quantity) => {
    try {
      // Récupérer les détails actuels du produit avec l'authentification WooCommerce
      const productRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products/${productId}?consumer_key=${process.env.NEXT_PUBLIC_WC_CONSUMER_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET}`
      );

      if (!productRes.ok) {
        throw new Error("Erreur lors de la récupération du produit");
      }

      const product = await productRes.json();
      const currentStock = product.stock_quantity;
      const newStock = currentStock - quantity;

      // Mettre à jour le stock du produit avec l'authentification WooCommerce
      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products/${productId}?consumer_key=${process.env.NEXT_PUBLIC_WC_CONSUMER_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stock_quantity: newStock
          }),
        }
      );

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du stock");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du stock:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        payment_method: "bacs",
        payment_method_title: "Paiement par virement bancaire",
        set_paid: false,
        billing: {
          first_name: user?.first_name || user?.name || '',
          last_name: user?.last_name || '',
          address_1: address,
          email: user?.email,
          phone: phone || '',
        },
        shipping: {
          first_name: user?.first_name || user?.name || '',
          last_name: user?.last_name || '',
          address_1: address,
          phone: phone || '',
        },
        line_items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        customer_id: user?.id || undefined,
      };

      // 1. Créer la commande avec le JWT token (comme avant)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur lors de la commande");
      }

      const result = await res.json();

      // 2. Mettre à jour le stock pour chaque produit avec les clés WC
      const updateStockPromises = items.map(item => 
        updateProductStock(item.product.id, item.quantity)
      );
      
      await Promise.all(updateStockPromises);

      alert("Commande passée avec succès !");
      router.push(`ordersforclient`);
      clearCart();
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) return (
    <div className="max-w-xl mx-auto p-6">
      <p className="text-orange-600">Votre panier est vide.</p>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-orange-600">Confirmer la commande</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Adresse de livraison</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Numéro de téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: 0612345678"
              />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-orange-700">Récapitulatif de la commande</h2>
            <ul className="space-y-2 mb-4">
              {items.map(item => (
                <li key={item.product.id} className="flex justify-between">
                  <span>{item.quantity} × {item.product.name}</span>
                  <span className="font-medium">{currency}{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-orange-200 pt-3">
              <p className="flex justify-between font-bold text-lg text-orange-700">
                <span>Total:</span>
                <span>{currency}{getCartAmount()}</span>
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-medium text-white ${
              loading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'
            } transition-colors shadow-md`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </span>
            ) : 'Confirmer et payer'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default ConfirmOrderPage;