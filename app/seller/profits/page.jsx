'use client'
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';

const StatsPage = () => {
  const [profitData, setProfitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthenticated, user } = useSelector(state => state.auth);
  const isShopManager = user?.roles?.includes('shop_manager') || false;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!isAuthenticated || !isShopManager) {
          throw new Error('Accès non autorisé');
        }

        // Récupérer les commandes des 12 derniers mois
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);

        const params = new URLSearchParams({
          after: startDate.toISOString(),
          before: endDate.toISOString(),
          per_page: '100',
          status: 'completed'
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/orders?${params.toString()}`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des commandes');
        }

        const orders = await response.json();
        const monthlyData = processOrderData(orders);
        setProfitData(monthlyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, isAuthenticated, isShopManager]);


  // Fonction pour traiter les données des commandes
  const processOrderData = (orders) => {
    const months = {};
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Initialiser tous les mois avec profit à 0
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      months[monthKey] = {
        name: monthNames[date.getMonth()],
        profit: 0
      };
    }

    // Ajouter les profits des commandes
    orders.forEach(order => {
      const orderDate = new Date(order.date_created);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      
      if (months[monthKey]) {
        months[monthKey].profit += parseFloat(order.total);
      }
    });

    // Convertir en tableau et trier par date
    return Object.values(months).sort((a, b) => {
      const monthA = monthNames.indexOf(a.name);
      const monthB = monthNames.indexOf(b.name);
      return monthA - monthB;
    });
  };

  // Calcul des indicateurs
  const totalProfit = profitData.reduce((sum, month) => sum + month.profit, 0);
  const averageProfit = Math.round(totalProfit / profitData.length);
  const growth = profitData.length > 1 
    ? ((profitData[profitData.length - 1].profit - profitData[0].profit) / profitData[0].profit) * 100 
    : 0;
  if (!isAuthenticated || !isShopManager) {
    return <div className="flex justify-center items-center h-screen">Accès non autorisé</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isShopManager) {
    return <div className="flex justify-center items-center h-screen">Accès non autorisé</div>;
  }



  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de Bord Financier</h1>
      
      {/* Cartes indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Profit Total</h3>
          <p className="text-3xl font-bold mt-2">{totalProfit.toLocaleString()} €</p>
          <div className={`mt-2 flex items-center ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {growth >= 0 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            <span className="ml-1">{Math.abs(growth).toFixed(1)}% vs année dernière</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Moyenne Mensuelle</h3>
          <p className="text-3xl font-bold mt-2">{averageProfit.toLocaleString()} €</p>
          <div className="mt-2 text-sm text-gray-500">Sur les 12 derniers mois</div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Dernier Mois</h3>
          <p className="text-3xl font-bold mt-2">{profitData[profitData.length - 1].profit.toLocaleString()} €</p>
          <div className="mt-2 text-sm text-gray-500">
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Évolution des Profits</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg">Annuel</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">Mensuel</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">Hebdo</button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} €`, 'Profit']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau des meilleurs mois */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Performances par Mois</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Évolution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...profitData].reverse().map((month, index) => {
                const prevMonth = profitData[profitData.length - index - 2];
                const evolution = prevMonth 
                  ? ((month.profit - prevMonth.profit) / prevMonth.profit) * 100 
                  : 0;
                
                return (
                  <tr key={month.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {month.profit.toLocaleString()} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`inline-flex items-center ${evolution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {evolution >= 0 ? (
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                        {Math.abs(evolution).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;