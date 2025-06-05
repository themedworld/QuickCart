import React from 'react'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {
    const { currency, router, addToCart } = useAppContext()

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
    }

    return (
        <div
            onClick={() => { router.push(`/ProductforClient/${product.id}`); window.scrollTo(0, 0) }}
            className="flex flex-col items-start gap-1 max-w-[180px] w-full cursor-pointer group"
        >
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
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                
                {/* Badge de promotion */}
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
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                    key={star}
                                    className={`h-3 w-3 ${star <= Math.floor(product.average_rating || 0) ? 'text-orange-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">{product.average_rating || 0}</span>
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

            {/* Bouton unique responsive */}
            <button 
                onClick={handleAddToCart}
                className="w-full mt-1 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 active:scale-95 transition-all duration-200"
            >
                Add to cart
            </button>
        </div>
    )
}

export default ProductCard