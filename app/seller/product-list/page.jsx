'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Loading from "@/components/Loading";
import ProtectedRoute from "@/components/ProtectedPage";
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const ProductList = () => {
  const router = useRouter();
  const { token, isAuthenticated, user } = useSelector(state => state.auth);
  const isShopManager = user?.roles?.includes('shop_manager') || false;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      if (!token) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des produits");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isShopManager) {
      fetchProducts();
    }
  }, [isAuthenticated, isShopManager, token]);

  const getCategoryName = (categories) => {
    if (!categories || categories.length === 0) return 'Autre';
    
    // Vérification par slug
    if (categories.some(cat => cat.slug === '1')) return 'Men Clothing';
    if (categories.some(cat => cat.slug === '2')) return 'Women Clothing';
    if (categories.some(cat => cat.slug === '3')) return 'Enfants Clothing';
    if (categories.some(cat => cat.slug === '4')) return 'Jewelry';
    if (categories.some(cat => cat.slug === '5')) return 'Bags & Sacs';
    if (categories.some(cat => cat.slug === '6')) return 'Chapeaux & Casquettes';
    if (categories.some(cat => cat.slug === '7')) return 'SmartPhone';
    
    return 'Autre';
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setProducts(products.filter(product => product.id !== productId));
      alert("Produit supprimé avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur lors de la suppression : ${error.message}`);
    }
  };

  if (!isAuthenticated || !isShopManager) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['shop_manager']}>
      <div className="min-h-screen bg-gray-50">
        {loading ? (
          <Loading />
        ) : (
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Liste des produits</h1>
                <p className="text-gray-500 mt-1">
                  {products.length} produit{products.length !== 1 ? 's' : ''} au total
                </p>
              </div>
              <button 
                onClick={() => router.push('/seller/add-product')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
              >
                <FiPlus className="mr-2" />
                Ajouter un produit
              </button>
            </div>

            {/* Empty State */}
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-orange-100 text-orange-500">
                  <FiBox className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun produit disponible</h3>
                <p className="mt-2 text-gray-500">Commencez par ajouter un nouveau produit.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  onClick={() => router.push('/seller/add-product')}
                >
                  Ajouter un produit
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                                {product.images?.[0]?.src ? (
                                  <img
                                    src={product.images[0].src}
                                    alt={product.name || "Produit sans nom"}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                    <span className="text-xs text-gray-500">Pas d'image</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name || "Produit sans nom"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {product.sku || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getCategoryName(product.categories)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.stock_quantity > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock_quantity > 0 ? `${product.stock_quantity} en stock` : 'Rupture'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {product.sale_price ? (
                              <>
                                <span className="line-through text-gray-400 mr-2">
                                  {product.regular_price}€
                                </span>
                                <span className="text-orange-600">
                                  {product.sale_price}€
                                </span>
                              </>
                            ) : (
                              <span>{product.regular_price}€</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => router.push(`/seller/edit-product/${product.id}`)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Modifier"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List */}
                <div className="min-h-screen bg-gray-50 pb-20 md:pb-0"> 
                <div className="md:hidden space-y-3 p-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                          {product.images?.[0]?.src ? (
                            <img
                              src={product.images[0].src}
                              alt={product.name || "Produit sans nom"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                              <span className="text-xs text-gray-500">Pas d'image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.name || "Produit sans nom"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getCategoryName(product.categories)}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <div>
                              {product.sale_price ? (
                                <>
                                  <span className="line-through text-xs text-gray-400 mr-1">
                                    {product.regular_price}€
                                  </span>
                                  <span className="text-sm font-medium text-orange-600">
                                    {product.sale_price}€
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-medium">
                                  {product.regular_price}€
                                </span>
                              )}
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-4 font-semibold rounded-full ${
                              product.stock_quantity > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock_quantity > 0 ? 'En stock' : 'Rupture'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/seller/edit-product/${product.id}`)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-md"
                          title="Modifier"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Supprimer"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
         </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProductList;