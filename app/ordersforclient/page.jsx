'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedPage";
import { FiEdit, FiTrash2, FiClock, FiCheckCircle, FiTruck, FiDollarSign } from 'react-icons/fi';
import Loading from '@/components/Loading';
  import { toast } from 'react-toastify'; // Ajoutez cette importation
const MyOrders = () => {
  const router = useRouter();
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/orders`);
        url.searchParams.append('customer', user?.id || 0);
        
        const res = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) throw new Error('Impossible de charger les commandes');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && token) fetchOrders();
  }, [token, user]);



const handleDelete = async (orderId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;

  try {
    // Vérifiez que les clés API sont bien définies
    if (!process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || !process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET) {
      throw new Error('Configuration API manquante');
    }

    // Méthode recommandée : Authentification Basic
    const authString = `${process.env.NEXT_PUBLIC_WC_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET}`;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/orders/${orderId}?force=true`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(authString).toString('base64')}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la suppression');
    }

    setOrders(orders.filter(order => order.id !== orderId));
    toast.success('Commande supprimée avec succès');
  } catch (err) {
    console.error('Delete error:', err);
    toast.error(err.message || 'Une erreur est survenue lors de la suppression');
  }
};

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiCheckCircle /> Complétée</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiClock /> En traitement</span>;
      case 'on-hold':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiClock /> En attente</span>;
      case 'shipped':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiTruck /> Expédiée</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const isModifiable = (orderDate) => {
    const now = new Date();
    const createdAt = new Date(orderDate);
    const diffInHours = (now - createdAt) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  if (loading) return <Loading />;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-2xl mx-auto my-8">{error}</div>;

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes commandes</h1>
          <p className="mt-2 text-gray-600">Historique de toutes vos commandes</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
            <p className="mt-2 text-gray-600">Vous n'avez pas encore passé de commande.</p>
            <button
              onClick={() => router.push('/products')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Voir les produits
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produits
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => {
                    const modifiable = isModifiable(order.date_created);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">#{order.number || order.id}</div>
                              <div className="mt-1">{getStatusBadge(order.status)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.date_created).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.date_created).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <ul className="list-disc pl-5 space-y-1">
                              {order.line_items.map(item => (
                                <li key={item.id}>
                                  {item.name} <span className="text-gray-500">× {item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiDollarSign className="text-gray-400 mr-1" />
                            <span className="font-medium">{order.total}</span>
                            <span className="ml-1 text-gray-500 text-sm">{order.currency}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {modifiable ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title="Voir détails"
                              >
                                <FiEdit className="mr-1" /> Détails
                              </button>
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                                title="Supprimer"
                              >
                                <FiTrash2 className="mr-1" /> 
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Lecture seule</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyOrders;
