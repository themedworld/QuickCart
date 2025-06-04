"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { FiShoppingCart, FiArrowLeft, FiChevronRight } from "react-icons/fi";

import { toast } from "react-toastify";
import Loading from "@/components/Loading";
import AllProducts from "@/app/all-products/page";
import { useAppContext } from '@/context/AppContext';


const ProductforClient = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
    const { currency, router, addToCart } = useAppContext()

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
    }
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

 

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  if (!isAuthenticated) return (
    <div className="text-center py-20">
      <p>Veuillez vous connecter pour voir ce produit</p>
      <button 
        onClick={() => router.push("/login")}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <FiArrowLeft className="mr-2" /> Retour
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain p-4"
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
                className={`aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border-2 ${mainImage === image.src ? 'border-blue-500' : 'border-transparent'}`}
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
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-500">(Aucun avis)</span>
          </div>

          <div className="text-3xl font-bold text-gray-900">
            {product.price_html ? (
              <span dangerouslySetInnerHTML={{ __html: product.price_html }} />
            ) : (
              `${product.price} €`
            )}
          </div>

          <div 
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }} 
          />

          {product.stock_quantity > 0 ? (
            <div className="text-green-600 font-medium">En stock ({product.stock_quantity} disponibles)</div>
          ) : (
            <div className="text-red-600 font-medium">En rupture de stock</div>
          )}

          {product.variations && product.variations.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Variations</label>
              <select
                onChange={(e) => setSelectedVariation(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {product.variations.map((variation) => (
                  <option key={variation.id} value={variation.id}>
                    {variation.attributes.map(attr => attr.option).join(" - ")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                disabled={product.stock_quantity && quantity >= product.stock_quantity}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FiShoppingCart /> Ajouter au panier
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
              className="flex-1 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Acheter maintenant <FiChevronRight className="inline ml-1" />
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Détails</h3>
            <div className="mt-4 space-y-2">
              <div className="flex">
                <span className="text-gray-500 w-32">Catégorie</span>
                <span className="text-gray-900">
                  {product.categories?.map(cat => cat.name).join(", ") || "Non spécifié"}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">SKU</span>
                <span className="text-gray-900">{product.sku || "Non spécifié"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </div>
   
     
  );

};

export default ProductforClient;