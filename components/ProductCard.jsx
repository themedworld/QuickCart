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
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                <Image
                    src={product.images?.[0]?.src || '/placeholder-product.png'}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />
                <button 
                    onClick={handleAddToCart}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate" dangerouslySetInnerHTML={{ __html: product.short_description }} />
            
            <div className="flex items-center gap-2">
                <p className="text-xs">{product.average_rating || 0}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <svg 
                            key={index}
                            className={`h-4 w-4 ${index < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-base font-medium">
                    {currency}{product.price}
                    {product.sale_price && (
                        <span className="text-xs text-gray-500 line-through ml-1">{currency}{product.regular_price}</span>
                    )}
                </p>
                <button 
                    onClick={handleAddToCart}
                    className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition"
                >
                    Add to cart
                </button>
            </div>
        </div>
    )
}

export default ProductCard