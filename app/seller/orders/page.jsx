'use client';
import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Loading from "@/components/Loading";
import ProtectedRoute from "@/components/ProtectedPage";
import { FiPlus, FiDownload, FiChevronLeft, FiChevronRight, FiBox, FiCheck, FiEdit } from "react-icons/fi";

const OrdersPage = () => {
  const router = useRouter();
  const { token, isAuthenticated, user } = useSelector(state => state.auth);
  const isShopManager = user?.roles?.includes('shop_manager') || false;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const ordersPerPage = 10;

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

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      // Mettre à jour l'état local
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      alert(`Statut de la commande #${orderId} mis à jour avec succès !`);
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
      alert(`Erreur lors de la mise à jour : ${error.message}`);
    } finally {
      setIsUpdating(false);
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

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <ProtectedRoute allowedRoles={['shop_manager']}>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Gestion des Commandes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
            </p>
          </div>
         
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400">
              <FiBox className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune commande disponible</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Commencez par créer une nouvelle commande.</p>
            <button 
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              onClick={() => router.push('/seller/add-order')}
            >
              Créer une commande
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commande</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produits</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentOrders.map(order => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{order.billing?.first_name} {order.billing?.last_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.billing?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white space-y-1">
                            {order.line_items?.map((item, index) => (
                              <div key={index} className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                                <span>{item.name} <span className="text-gray-500 dark:text-gray-400 ml-1">×{item.quantity}</span></span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                          {order.total} {order.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
                            order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                            order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                            order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                            order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                            'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                          } capitalize`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {order.status !== 'completed' ? (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              disabled={isUpdating}
                              className="flex items-center justify-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800/50 transition"
                              title="Marquer comme complétée"
                            >
                              <FiCheck className="mr-1" />
                              <span>Valider</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              disabled={isUpdating}
                              className="flex items-center justify-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                              title="Modifier le statut"
                            >
                              <FiEdit className="mr-1" />
                              <span>Modifier</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-0">
                  Affichage de <span className="font-medium">{indexOfFirstOrder + 1}</span> à <span className="font-medium">{Math.min(indexOfLastOrder, orders.length)}</span> sur <span className="font-medium">{orders.length}</span> commandes
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === i + 1 
                          ? 'bg-orange-600 text-white border-orange-600' 
                          : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile List */}
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0"> 
            <div className="md:hidden space-y-3">
              {currentOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Commande #{order.id}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.date_created).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                      order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                      order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                      'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    } capitalize`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.billing?.first_name} {order.billing?.last_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.billing?.email}</p>
                  </div>
                  
                  <div className="mb-3 space-y-1">
                    {order.line_items?.map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                        <span className="text-gray-900 dark:text-white">{item.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Total: {order.total} {order.currency}
                    </span>
                    {order.status !== 'completed' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={isUpdating}
                        className="flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800/50 transition text-sm"
                      >
                        <FiCheck className="mr-1" />
                        Valider
                      </button>
                    ) : (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={isUpdating}
                        className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
                      >
                        <FiEdit className="mr-1" />
                        Modifier
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Mobile Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="mr-1" />
                  Précédent
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} sur {totalPages}
                </span>
                <button 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <FiChevronRight className="ml-1" />
                </button>
              </div>
            </div> </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default OrdersPage;
