'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Loading from "@/components/Loading";
import Footer from "@/components/seller/Footer";
import ProtectedRoute from "@/components/ProtectedPage";
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

  if (!isAuthenticated || !isShopManager) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

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

  return (<ProtectedRoute allowedRoles={['shop_manager']}>
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">Tous les produits</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Produit</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">Catégorie</th>
                  <th className="px-4 py-3 font-medium truncate">Prix</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="bg-gray-500/10 rounded p-2">
                        {product.images?.[0]?.src ? (
                          // Solution 1: Avec next/image (nécessite la configuration du domaine)
                          // <Image
                          //   src={product.images[0].src}
                          //   alt={product.name || "Produit sans nom"}
                          //   width={100}
                          //   height={100}
                          //   className="w-16 h-16 object-cover"
                          // />
                          
                          // Solution 2: Avec balise img standard
                          <img
                            src={product.images[0].src}
                            alt={product.name || "Produit sans nom"}
                            className="w-16 h-16 object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-200">
                            <span className="text-xs text-gray-500">Pas dimage</span>
                          </div>
                        )}
                      </div>
                      <span className="truncate w-full">
                        {product.name || "Produit sans nom"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {getCategoryName(product.categories)}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 max-sm:hidden">
                      <button 
                        onClick={() => router.push(`/product/${product.id}`)} 
                        className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md"
                      >
                        <span className="hidden md:block">Voir</span>
                        <Image
                          className="h-3.5"
                          src={assets.redirect_icon || "/default-redirect-icon.png"}
                          alt="Voir le produit"
                          width={16}
                          height={16}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div></ProtectedRoute>
  );
};

export default ProductList;