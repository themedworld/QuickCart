'use client';

import { useSelector, useDispatch } from 'react-redux';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from 'next/image';

const CartPage = () => {
  const cartItems = useSelector(state => state.cart.items);
  const { currency } = useAppContext();
  const dispatch = useDispatch();

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  return (
    <>
      <Navbar />
      <div className="p-6 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 border-b pb-4">
                  <Image
                    src={item.images?.[0]?.src || "/placeholder-product.png"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{currency}{item.price}</p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item))}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <p className="text-lg font-semibold">Total: {currency}{total.toFixed(2)}</p>
              <button className="mt-2 px-6 py-2 bg-black text-white rounded hover:bg-gray-800">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
