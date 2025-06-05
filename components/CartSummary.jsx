'use client'
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiTrash2, FiChevronUp, FiShoppingCart, FiChevronDown } from "react-icons/fi";

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
                    className={`relative w-16 h-16 flex items-center justify-center rounded-full shadow-lg bg-orange-500 text-white hover:bg-orange-600 transition-all transform hover:scale-110 ${totalItems ? 'animate-pulse' : 'opacity-70'}`}
                    aria-label="Ouvrir le panier"
                >
                    <FiShoppingCart size={24} />
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-orange-600 border-2 border-orange-500 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </button>
            )}

            {/* Panier détaillé */}
            {isExpanded && (
                <div className={`bg-white border border-orange-100 shadow-xl rounded-xl overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-90' : 'opacity-100'}`}>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-orange-700">
                                <button 
                                    onClick={toggleExpand}
                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                                    aria-label="Fermer le panier"
                                >
                                    <FiChevronDown size={20} />
                                </button>
                                <span>Votre Panier</span>
                                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                    {totalItems} article{totalItems > 1 ? 's' : ''}
                                </span>
                            </h2>
                        </div>
                        
                        <div className="max-h-[50vh] overflow-y-auto">
                            {items.length > 0 ? (
                                <ul className="space-y-3">
                                    {items.map(({ product, quantity, price }) => (
                                        <li key={product.id} className="flex gap-3 items-start pb-3 border-b border-orange-50">
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-orange-100">
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
                                                        className="text-gray-500 hover:text-orange-600 transition-colors p-1"
                                                        aria-label={`Supprimer ${product.name} du panier`}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center border border-orange-200 rounded-md">
                                                            <button 
                                                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                                                className="px-2 py-1 text-orange-600 hover:bg-orange-50 transition-colors"
                                                                aria-label="Réduire la quantité"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="px-2 text-sm w-8 text-center font-medium">
                                                                {quantity}
                                                            </span>
                                                            <button 
                                                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                                                className="px-2 py-1 text-orange-600 hover:bg-orange-50 transition-colors"
                                                                aria-label="Augmenter la quantité"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-orange-600">
                                                        {currency}{(price * quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <FiShoppingCart size={32} className="mx-auto text-orange-200 mb-2" />
                                    <p>Votre panier est vide</p>
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-orange-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-medium text-gray-700">Total:</span>
                                    <span className="text-lg font-bold text-orange-600">
                                        {currency}{getCartAmount()}
                                    </span>
                                </div>

                                <Link 
                                    href="/checkout" 
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-medium text-center block transition-all duration-200 mb-2 shadow-md hover:shadow-lg"
                                >
                                    Commander maintenant
                                </Link>

                                <button
                                    onClick={() => {
                                        if (confirm("Vider votre panier ?")) {
                                            items.forEach(item => removeFromCart(item.product.id));
                                        }
                                    }}
                                    className="w-full text-sm text-orange-500 hover:text-orange-700 py-2 flex items-center justify-center gap-1 transition-colors"
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