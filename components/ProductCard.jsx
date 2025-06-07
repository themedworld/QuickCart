import React, { useState } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {
    const { currency, router, addToCart, cartItems } = useAppContext();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        
        if (product.stock_quantity === 0) {
            alert("Ce produit est en rupture de stock.");
            return;
        }
        
        const currentQuantityInCart = cartItems[product.id]?.quantity || 0;
        if (currentQuantityInCart >= product.stock_quantity) {
            alert(`Stock insuffisant! Maximum ${product.stock_quantity} unité(s) autorisée(s).`);
            return;
        }
        
        addToCart(product);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    }

    // Calcul des états
    const quantityInCart = cartItems[product.id]?.quantity || 0;
    const isOutOfStock = product.stock_quantity === 0;
    const isStockLimited = quantityInCart >= product.stock_quantity;
    const averageRating = product.average_rating ? parseFloat(product.average_rating) : 0;
    const roundedRating = Math.round(averageRating * 2) / 2;

    return (
        <div
            onClick={() => { router.push(`/ProductforClient/${product.id}`); window.scrollTo(0, 0) }}
            className="flex flex-col items-start gap-1 max-w-[180px] w-full cursor-pointer group relative"
        >
            {/* Notification de succès */}
            {showSuccess && (
                <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-xs py-1 px-2 text-center animate-fade-in">
                    Ajouté au panier!
                </div>
            )}

            <div className="relative bg-gray-100 rounded-lg w-full aspect-[3/4] flex items-center justify-center overflow-hidden">
                <Image
                    src={product.images?.[0]?.src || '/placeholder-product.png'}
                    alt={product.name}
                    className="group-hover:scale-105 transition-transform duration-300 object-contain w-full h-full p-2"
                    width={400}
                    height={400}
                    priority={false}
                />
                <button 
                    onClick={handleAddToCart}
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-orange-500 hover:text-white transition-all duration-200"
                    disabled={isOutOfStock}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                
                {product.sale_price && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                        PROMO
                    </span>
                )}
            </div>

            <div className="w-full pt-1 space-y-1">
                <p className="text-sm font-medium truncate">{product.name}</p>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const starType = star <= roundedRating 
                                    ? 'full' 
                                    : (star - 0.5 <= roundedRating ? 'half' : 'empty');
                                
                                return (
                                    <div key={star} className="relative h-3 w-3">
                                        {starType === 'full' ? (
                                            <svg className="h-3 w-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ) : starType === 'half' ? (
                                            <>
                                                <svg className="h-3 w-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <svg className="h-3 w-3 text-orange-400 absolute left-0 top-0" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </>
                                        ) : (
                                            <svg className="h-3 w-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <span className="text-xs text-gray-500">
                            {averageRating.toFixed(1)}
                        </span>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-sm font-semibold text-orange-600">
                            {currency}{product.price}
                        </p>
                        {product.sale_price && (
                            <p className="text-[10px] text-gray-400 line-through">
                                {currency}{product.regular_price}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full mt-1 px-3 py-1.5 text-white text-xs rounded-md active:scale-95 transition-all duration-200 ${
                    isOutOfStock 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600'
                }`}
            >
                {isOutOfStock ? 'Rupture de stock' : 'Add to cart'}
                {quantityInCart > 0 && !isOutOfStock && (
                    <span className="ml-1 bg-white text-orange-500 px-1 rounded-full text-[10px]">
                        {quantityInCart}
                    </span>
                )}
            </button>

            {!isOutOfStock && isStockLimited && (
                <p className="text-xs text-red-500 mt-1 text-center w-full">
                    Maximum {product.stock_quantity} unité(s)
                </p>
            )}
        </div>
    )
}

export default ProductCard;