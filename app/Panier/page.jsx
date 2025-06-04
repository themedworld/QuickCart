'use client';
import { useCartContext } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PanierPage = () => {
  const { cart, removeFromCart } = useCartContext();

  const total = cart.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🛒 Mon Panier</h1>

        {cart.length === 0 ? (
          <p className="text-gray-500">Votre panier est vide.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h2 className="text-lg font-medium">{item.title}</h2>
                  <p className="text-sm text-gray-600">{item.price} €</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}

            <div className="text-right mt-6 font-semibold">
              Total : {total} €
            </div>

            <button className="mt-4 bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
              Passer la commande
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PanierPage;
