'use client'
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';

const StatsPage = () => {
  const [profitData, setProfitData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('yearly');
  const { token, isAuthenticated, user } = useSelector(state => state.auth);
  const isShopManager = user?.roles?.includes('shop_manager') || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAuthenticated || !isShopManager) {
          throw new Error('Accès non autorisé');
        }

        setLoading(true);
        setError(null);

        // Récupérer les commandes
        const endDate = new Date();
        const startDate = new Date();
        
        if (timeRange === 'yearly') {
          startDate.setMonth(startDate.getMonth() - 11);
        } else if (timeRange === 'monthly') {
          startDate.setDate(startDate.getDate() - 30);
        } else { // weekly
          startDate.setDate(startDate.getDate() - 7);
        }

        const params = new URLSearchParams({
          after: startDate.toISOString(),
          before: endDate.toISOString(),
          per_page: '100',
          status: 'completed'
        });

        // Fetch orders
        const ordersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/orders?${params.toString()}`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!ordersResponse.ok) {
          throw new Error('Erreur lors de la récupération des commandes');
        }

        const orders = await ordersResponse.json();
        
        // Fetch products for additional stats
        const productsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products?per_page=100`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!productsResponse.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }

        const products = await productsResponse.json();

        // Process data
        const processedProfitData = processOrderData(orders, timeRange);
        const processedProductData = processProductData(orders, products);
        const processedCustomerData = processCustomerData(orders);

        setProfitData(processedProfitData);
        setProductData(processedProductData.slice(0, 5)); // Top 5 produits
        setCustomerData(processedCustomerData.slice(0, 5)); // Top 5 clients
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated, isShopManager, timeRange]);

  // Fonction pour traiter les données des commandes
  const processOrderData = (orders, range) => {
    const data = {};
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    const currentDate = new Date();
    let periodCount, periodFormat, periodKeyFn, periodNameFn;

    if (range === 'yearly') {
      periodCount = 12;
      periodFormat = (date) => `${date.getFullYear()}-${date.getMonth()}`;
      periodNameFn = (date) => monthNames[date.getMonth()];
    } else if (range === 'monthly') {
      periodCount = 30;
      periodFormat = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      periodNameFn = (date) => `${date.getDate()} ${monthNames[date.getMonth()]}`;
    } else { // weekly
      periodCount = 7;
      periodFormat = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      periodNameFn = (date) => dayNames[date.getDay()];
    }

    // Initialiser toutes les périodes avec profit à 0
    for (let i = periodCount - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      if (range === 'yearly') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      const periodKey = periodFormat(date);
      data[periodKey] = {
        name: periodNameFn(date),
        profit: 0,
        orders: 0,
        averageOrder: 0
      };
    }

    // Ajouter les données des commandes
    orders.forEach(order => {
      const orderDate = new Date(order.date_created);
      let periodKey;
      
      if (range === 'yearly') {
        periodKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      } else if (range === 'monthly') {
        periodKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}-${orderDate.getDate()}`;
      } else { // weekly
        periodKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}-${orderDate.getDate()}`;
      }
      
      if (data[periodKey]) {
        data[periodKey].profit += parseFloat(order.total);
        data[periodKey].orders += 1;
      }
    });

    // Calculer la moyenne par commande
    Object.keys(data).forEach(key => {
      if (data[key].orders > 0) {
        data[key].averageOrder = data[key].profit / data[key].orders;
      }
    });

    // Convertir en tableau et trier par date
    return Object.values(data).sort((a, b) => {
      if (range === 'yearly') {
        return monthNames.indexOf(a.name) - monthNames.indexOf(b.name);
      }
      return 0; // Pour daily/weekly, l'ordre initial est déjà correct
    });
  };

  // Fonction pour traiter les données des produits
  const processProductData = (orders, products) => {
    const productMap = {};
    
    // Initialiser tous les produits
    products.forEach(product => {
      productMap[product.id] = {
        id: product.id,
        name: product.name,
        sales: 0,
        revenue: 0,
        stock: product.stock_quantity || 0
      };
    });

    // Compter les ventes et revenus
    orders.forEach(order => {
      order.line_items.forEach(item => {
        if (productMap[item.product_id]) {
          productMap[item.product_id].sales += item.quantity;
          productMap[item.product_id].revenue += parseFloat(item.total);
        }
      });
    });

    // Convertir en tableau et trier par revenu
    return Object.values(productMap)
      .filter(product => product.sales > 0)
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Fonction pour traiter les données des clients
  const processCustomerData = (orders) => {
    const customerMap = {};
    
    orders.forEach(order => {
      const customerId = order.customer_id;
      if (!customerId) return;
      
      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          id: customerId,
          name: order.billing.first_name + ' ' + order.billing.last_name,
          email: order.billing.email,
          orders: 0,
          totalSpent: 0
        };
      }
      
      customerMap[customerId].orders += 1;
      customerMap[customerId].totalSpent += parseFloat(order.total);
    });

    // Convertir en tableau et trier par montant dépensé
    return Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  };

  // Calcul des indicateurs
  const totalProfit = profitData.reduce((sum, period) => sum + period.profit, 0);
  const totalOrders = profitData.reduce((sum, period) => sum + period.orders, 0);
  const averageProfit = profitData.length > 0 ? Math.round(totalProfit / profitData.length) : 0;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalProfit / totalOrders) : 0;
  
  const growth = profitData.length > 1 
    ? ((profitData[profitData.length - 1].profit - profitData[0].profit) / profitData[0].profit * 100) : 0;

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
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Tableau de Bord Financier</h1>
      
      {/* Filtres période */}
      <div className="flex mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeRange('yearly')}
            className={`px-3 py-1 text-sm rounded-lg ${timeRange === 'yearly' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            Annuel
          </button>
          <button 
            onClick={() => setTimeRange('monthly')}
            className={`px-3 py-1 text-sm rounded-lg ${timeRange === 'monthly' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            Mensuel
          </button>
          <button 
            onClick={() => setTimeRange('weekly')}
            className={`px-3 py-1 text-sm rounded-lg ${timeRange === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            Hebdo
          </button>
        </div>
      </div>

      {/* Cartes indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm md:text-base font-medium text-gray-500">Chiffre d'Affaires</h3>
          <p className="text-xl md:text-2xl font-bold mt-1">{totalProfit.toLocaleString()} €</p>
          <div className={`mt-1 flex items-center text-xs md:text-sm ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {growth >= 0 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            <span className="ml-1">{Math.abs(growth).toFixed(1)}% vs période précédente</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm md:text-base font-medium text-gray-500">Commandes</h3>
          <p className="text-xl md:text-2xl font-bold mt-1">{totalOrders.toLocaleString()}</p>
          <div className="mt-1 text-xs md:text-sm text-gray-500">Total des commandes</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm md:text-base font-medium text-gray-500">Panier Moyen</h3>
          <p className="text-xl md:text-2xl font-bold mt-1">{averageOrderValue.toLocaleString()} €</p>
          <div className="mt-1 text-xs md:text-sm text-gray-500">Par commande</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm md:text-base font-medium text-gray-500">Moyenne {timeRange === 'yearly' ? 'Mensuelle' : timeRange === 'monthly' ? 'Quotidienne' : 'Journalière'}</h3>
          <p className="text-xl md:text-2xl font-bold mt-1">{averageProfit.toLocaleString()} €</p>
          <div className="mt-1 text-xs md:text-sm text-gray-500">
            {timeRange === 'yearly' ? 'Sur 12 mois' : timeRange === 'monthly' ? 'Sur 30 jours' : 'Sur 7 jours'}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique principal */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Évolution du Chiffre d'Affaires</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${value}€`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '14px'
                  }}
                  formatter={(value) => [`${value} €`, 'CA']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 2 }}
                  activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique produits */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Produits</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }}
                  hide={productData.some(p => p.name.length > 10)} // Cache si noms trop longs
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${value}€`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '14px'
                  }}
                  formatter={(value) => [`${value} €`, 'Revenu']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tableau des meilleurs clients */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Meilleurs Clients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commandes</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerData.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {customer.name || customer.email.split('@')[0]}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                      {customer.orders}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                      {customer.totalSpent.toLocaleString()} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tableau des meilleurs produits */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Meilleurs Produits</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventes</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productData.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {product.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                      {product.sales}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                      {product.revenue.toLocaleString()} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Détails par période */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Détails par Période</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CA</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commandes</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Moyenne</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...profitData].reverse().map((period, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {period.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                    {period.profit.toLocaleString()} €
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {period.orders}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {period.averageOrder.toLocaleString()} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;