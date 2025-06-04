'use client'
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiTrash2, FiChevronUp, FiShoppingCart } from "react-icons/fi";

const CartSummary = () => {
    const { cartItems, currency, getCartAmount, updateCartQuantity, removeFromCart } = useAppContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const items = Object.values(cartItems || {});

    const toggleExpand = () => {
        if (!items.length) return;
        setIsAnimating(true);
        setIsExpanded(!isExpanded);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        updateCartQuantity(productId, newQuantity);
    };

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className={`fixed right-4 bottom-4 md:top-auto md:bottom-4 md:right-10 z-40 transition-all duration-300 ease-in-out ${isExpanded ? 'w-80' : 'w-16 h-16'}`}>
            {/* Bouton compact quand fermé */}
            {!isExpanded && (
                <button
                    onClick={toggleExpand}
                    disabled={!totalItems}
                    className={`relative w-16 h-16 flex items-center justify-center rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-all ${totalItems ? 'animate-bounce' : 'opacity-70'}`}
                    aria-label="Ouvrir le panier"
                >
                    <FiShoppingCart size={24} />
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </button>
            )}

            {/* Panier détaillé */}
            {isExpanded && (
                <div className={`bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-90' : 'opacity-100'}`}>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <button 
                                    onClick={toggleExpand}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Fermer le panier"
                                >
                                    <FiChevronUp size={20} />
                                </button>
                                <span>Votre Panier</span>
                                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                    {totalItems} article{totalItems > 1 ? 's' : ''}
                                </span>
                            </h2>
                        </div>
                        
                        <div className="max-h-[50vh] overflow-y-auto">
                            {items.length > 0 ? (
                                <ul className="space-y-3">
                                    {items.map(({ product, quantity, price }) => (
                                        <li key={product.id} className="flex gap-3 items-start pb-3 border-b border-gray-100">
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                                <Image
                                                    src={product.images?.[0]?.src || '/placeholder-product.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium truncate">{product.name}</h3>
                                                    <button 
                                                        onClick={() => removeFromCart(product.id)}
                                                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                        aria-label={`Supprimer ${product.name} du panier`}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center border border-gray-200 rounded-md">
                                                            <button 
                                                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                                aria-label="Réduire la quantité"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="px-2 text-sm w-8 text-center">
                                                                {quantity}
                                                            </span>
                                                            <button 
                                                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                                aria-label="Augmenter la quantité"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-blue-600">
                                                        {currency}{(price * quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center py-4 text-gray-500">Votre panier est vide</p>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-medium">Total:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {currency}{getCartAmount()}
                                    </span>
                                </div>

                                <Link 
                                    href="/checkout" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center block transition-colors duration-200 mb-2"
                                >
                                    Commander
                                </Link>

                                <button
                                    onClick={() => {
                                        if (confirm("Vider votre panier ?")) {
                                            items.forEach(item => removeFromCart(item.product.id));
                                        }
                                    }}
                                    className="w-full text-sm text-red-500 hover:text-red-700 py-2 flex items-center justify-center gap-1"
                                >
                                    <FiTrash2 size={14} /> Vider le panier
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartSummary;