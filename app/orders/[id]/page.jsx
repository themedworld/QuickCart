'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedPage";
const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API}/wp-json/wc/v3/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!res.ok) throw new Error("Commande introuvable");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <p>Chargement de la commande...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!order) return null;

  return (  <ProtectedRoute allowedRoles={['customer']}>
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Commande #{order.id}</h1>
      <p><strong>Date :</strong> {new Date(order.date_created).toLocaleString()}</p>
      <p><strong>Total :</strong> {order.total} {order.currency}</p>

      <h2 className="text-lg mt-4 font-semibold">Produits :</h2>
      <ul className="list-disc ml-5">
        {order.line_items.map(item => (
          <li key={item.id}>
            {item.quantity} x {item.name} — {item.total} {order.currency}
          </li>
        ))}
      </ul>

      <h2 className="text-lg mt-4 font-semibold">Adresse de livraison :</h2>
      <p>{order.shipping.address_1}</p>
    </div></ProtectedRoute>
  );
};

export default OrderDetailPage;
