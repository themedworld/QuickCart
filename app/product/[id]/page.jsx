"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { assets } from "@/assets/assets";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Product = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la récupération du produit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token && id) {
      fetchProductById();
    }
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      
      alert("Produit supprimé avec succès");
      router.push("/products"); // Redirige vers la liste des produits après suppression
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  if (!isAuthenticated) return <p className="text-center py-20">Veuillez vous connecter</p>;
  if (loading) return <Loading />;
  if (!product) return <p className="text-center py-20">Produit non trouvé</p>;

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        {/* Confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
              <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-auto object-cover mix-blend-multiply"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image.src)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <img src={image.src} alt={product.name} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">{product.name}</h1>
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" src={assets.star_icon} alt="star" />
              <p>(Aucune note)</p>
            </div>
            <p className="text-gray-600 mt-3" dangerouslySetInnerHTML={{ __html: product.description }}></p>
            <p className="text-3xl font-medium mt-6">
              {product.price_html ? (
                <span dangerouslySetInnerHTML={{ __html: product.price_html }} />
              ) : (
                `$${product.price}`
              )}
            </p>
            <hr className="bg-gray-600 my-6" />
            <table className="table-auto border-collapse w-full max-w-72">
              <tbody>
                <tr>
                  <td className="text-gray-600 font-medium">Catégorie</td>
                  <td className="text-gray-800/50">
                    {product.categories?.[0]?.name || "Non défini"}
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-600 font-medium">Stock</td>
                  <td className="text-gray-800/50">{product.stock_quantity ?? "N/A"}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Supprimer
              </button>
              <button
                onClick={() => router.push(`/seller/edit-product/${id}`)}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;