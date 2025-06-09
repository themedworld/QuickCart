'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedPage";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('16');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [stock, setStock] = useState('');
  const [color, setColor] = useState('');
  const [variant, setVariant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token, isAuthenticated, user } = useSelector(state => state.auth);
  const isShopManager = user?.roles?.includes('shop_manager') || false;
  const router = useRouter();

  if (!isAuthenticated || !isShopManager) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token) throw new Error("Utilisateur non authentifié");
      if (!name || !description || !price) throw new Error("Veuillez remplir tous les champs obligatoires");

      // Étape 1 : Upload des images une par une
      const uploadedImages = [];

      for (const file of files) {
        if (!file) continue;

        const imageFormData = new FormData();
        imageFormData.append("file", file);
        imageFormData.append("title", file.name);
        imageFormData.append("alt_text", name);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wp/v2/media`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageFormData
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          console.error("Erreur d'upload image:", uploadErr);
          throw new Error(`Échec de l'upload d'image: ${uploadErr.message}`);
        }

        const uploadData = await uploadRes.json();
        uploadedImages.push({
          id: uploadData.id
        });
      }

      // Étape 2 : Création du produit avec les images uploadées
      const productData = {
        name,
        type: "simple",
        description,
        regular_price: price,
        sale_price: offerPrice || undefined,
        categories: [{ id: Number(category) }],
        images: uploadedImages,
        stock_quantity: stock ? Number(stock) : 0,
        manage_stock: true,
        attributes: [
          {
            name: 'Color',
            visible: true,
            variation: true,
            options: [color]
          },
          {
            name: 'Variant',
            visible: true,
            variation: true,
            options: [variant]
          }
        ]
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wp-json/wc/v3/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erreur création produit:", errorData);
        throw new Error(errorData.message || "Erreur lors de l'ajout du produit");
      }

      await res.json();
      alert("Produit ajouté avec succès !");
      setName('');
      setDescription('');
      setPrice('');
      setOfferPrice('');
      setStock('');
      setColor('');
      setVariant('');
      setFiles([]);

    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError(err.message);
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['shop_manager']}>
       <div className="min-h-screen bg-gray-50 pb-20 md:pb-0"> 
      <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
        <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg mx-auto bg-white rounded-lg shadow-md mt-10 mb-10">
          <h1 className="text-2xl font-bold text-gray-800">Ajouter un nouveau produit</h1>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div>
            <p className="text-base font-medium">Images du produit</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {[...Array(4)].map((_, index) => (
                <label key={index} htmlFor={`image${index}`} className="cursor-pointer">
                  <input 
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }} 
                    type="file" 
                    id={`image${index}`} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                    <Image
                      className="w-full h-full object-cover"
                      src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                      alt="Preview"
                      width={100}
                      height={100}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="product-name">
                Nom du produit
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="Entrez le nom"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="category">
                Catégorie
              </label>
              <select
                id="category"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              > 
                <option value="16">Men Clothing</option>
                <option value="17">Women Clothing</option>
                <option value="18">Kids Clothing</option>
                <option value="19">Bags & Sacs</option>
                <option value="20">Chapeaux & Casquettes</option>
                <option value="21">Jewelry</option>
                <option value="22">SmartPhone</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="product-description">
              Description du produit
            </label>
            <textarea
              id="product-description"
              rows={4}
              className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500 resize-none"
              placeholder="Décrivez le produit..."
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="product-price">
                Prix (€)
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Prix normal"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500"
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="offer-price">
                Prix promotionnel (€)
              </label>
              <input
                id="offer-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Prix promotionnel"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500"
                onChange={(e) => setOfferPrice(e.target.value)}
                value={offerPrice}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="stock">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                placeholder="Quantité en stock"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500"
                onChange={(e) => setStock(e.target.value)}
                value={stock}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="color">
                Couleur
              </label>
              <input
                id="color"
                type="text"
                placeholder="Couleur du produit"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500"
                onChange={(e) => setColor(e.target.value)}
                value={color}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="variant">
                Variant
              </label>
              <input
                id="variant"
                type="text"
                placeholder="Variante du produit"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500"
                onChange={(e) => setVariant(e.target.value)}
                value={variant}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`px-8 py-3 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                En cours...
              </span>
            ) : 'AJOUTER LE PRODUIT'}
          </button>
        </form>
      </div></div>
    </ProtectedRoute>
  );
};

export default AddProduct;