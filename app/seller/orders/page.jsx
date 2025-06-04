'use client';
import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Loading from "@/components/Loading";
import Footer from "@/components/seller/Footer";
import ProtectedRoute from "@/components/ProtectedPage";
const OrdersPage = () => {
  const router = useRouter();
  const { token, isAuthenticated, user } = useSelector(state => state.auth);
  const isShopManager = user?.roles?.includes('shop_manager') || false;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      if (!token) throw new Error("Utilisateur non authentifié");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Erreur de chargement des commandes :", error);
      alert(`Erreur de chargement des commandes : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isShopManager) {
      fetchOrders();
    }
  }, [isAuthenticated, isShopManager, token]);

  if (!isAuthenticated || !isShopManager) {
    return <div className="flex justify-center items-center h-screen">Accès non autorisé</div>;
  }

  if (loading) {
    return <Loading />;
  }

  return (
<ProtectedRoute allowedRoles={['shop_manager']}>
  <div className="p-6 max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des Commandes</h1>
      <div className="flex space-x-2">
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
          Exporter
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Nouvelle commande
        </button>
      </div>
    </div>

    {orders.length === 0 ? (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune commande disponible</h3>
        <p className="mt-1 text-gray-500">Commencez par créer une nouvelle commande.</p>
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.billing?.first_name} {order.billing?.last_name}</div>
                    <div className="text-sm text-gray-500">{order.billing?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      {order.line_items?.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                          <span>{item.name} <span className="text-gray-500 ml-1">×{item.quantity}</span></span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {order.total} {order.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date_created).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    } capitalize`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Affichage de <span className="font-medium">1</span> à <span className="font-medium">{orders.length}</span> sur <span className="font-medium">{orders.length}</span> commandes
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Précédent
            </button>
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    )}
 
  </div></ProtectedRoute>

);


};

export default OrdersPage;
