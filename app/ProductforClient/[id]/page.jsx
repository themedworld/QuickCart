"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { FiShoppingCart, FiArrowLeft, FiChevronRight, FiPlus, FiMinus } from "react-icons/fi";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";
import { useAppContext } from '@/context/AppContext';

const ProductforClient = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const { currency, addToCart } = useAppContext();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const fetchProductById = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur de récupération");
      const data = await res.json();
      setProduct(data);
      setMainImage(data.images?.[0]?.src || null);
      if (data.variations && data.variations.length > 0) {
        setSelectedVariation(data.variations[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la récupération du produit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token && id) {
      fetchProductById();
    }
  }, [id, token]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const productToAdd = {
      ...product,
      quantity: quantity // Ajoute la quantité sélectionnée
    };
    addToCart(productToAdd);
    toast.success(`${quantity} ${product.name} ajouté(s) au panier`);
  };

  const handleBuyNow = () => {
    handleAddToCart({ preventDefault: () => {} });
    router.push("/cart");
  };

  if (!isAuthenticated) return (
    <div className="text-center py-20">
      <p className="text-gray-700 mb-4">Veuillez vous connecter pour voir ce produit</p>
      <button 
        onClick={() => router.push("/login")}
        className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-md"
      >
        Se connecter
      </button>
    </div>
  );

  if (loading) return <Loading />;
  if (!product) return <p className="text-center py-20">Produit non trouvé</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-orange-600 hover:text-orange-800 mb-6 transition"
      >
        <FiArrowLeft className="mr-2" /> Retour
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center shadow-sm border border-gray-200">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="text-gray-400">Aucune image</div>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {product.images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setMainImage(image.src)}
                className={`aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border-2 transition-all ${
                  mainImage === image.src 
                    ? 'border-orange-500 scale-105' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img 
                  src={image.src} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-2"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= Math.floor(product.average_rating || 0) ? 'text-orange-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-500">({product.average_rating || 0} avis)</span>
          </div>

          <div className="text-3xl font-bold text-gray-900">
            {product.price_html ? (
              <span dangerouslySetInnerHTML={{ __html: product.price_html }} />
            ) : (
              `${currency}${product.price}`
            )}
            {product.sale_price && (
              <span className="text-lg text-gray-500 line-through ml-2">
                {currency}${product.regular_price}
              </span>
            )}
          </div>

          <div 
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }} 
          />



          {product.variations && product.variations.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Variations</label>
              <select
                onChange={(e) => setSelectedVariation(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                {product.variations.map((variation) => (
                  <option key={variation.id} value={variation.id}>
                    {variation.attributes.map(attr => attr.option).join(" - ")}
                  </option>
                ))}
              </select>
            </div>
          )}

         
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-95"
            >
              <FiShoppingCart /> Ajouter au panier
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
              className="flex-1 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-95"
            >
              Acheter maintenant <FiChevronRight className="inline ml-1" />
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du produit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Catégorie</h4>
                <p className="text-gray-900">
                  {product.categories?.map(cat => cat.name).join(", ") || "Non spécifié"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Référence</h4>
                <p className="text-gray-900">{product.sku || "Non spécifié"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductforClient;