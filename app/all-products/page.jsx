'use client';
import ProductCard from "@/components/ProductCard";
import NavbarClient from "@/components/NavbarClient";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { useAppContext, AppContextProvider } from "@/context/AppContext";
import { useSelector } from 'react-redux';
import CartSummary from "@/components/CartSummary";
import ProtectedRoute from "@/components/ProtectedPage";

const AllProducts = () => {
    const authData = useSelector(state => state.auth);

    return (
        <ProtectedRoute allowedRoles={['customer']}>
         
                <NavbarClient />
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">All Products</h1>
                    <ProductsList />
                </div>
                <CartSummary />
          
        </ProtectedRoute>
    );
};

const ProductsList = () => {
    const { products } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);

    // Extract unique categories from products
     useEffect(() => {
        if (products?.length) {
            // Filter out undefined/null categories and get unique values
            const uniqueCategories = ['all', ...new Set(
                products
                    .map(product => product.category)
                    .filter(category => category != null)
            )];
            setCategories(uniqueCategories);
        }
    }, [products]);

    const filteredProducts = products?.filter(product => {
        // Filter by category
        const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
        
        // Filter by search term (case insensitive)
        const searchMatch = 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return categoryMatch && searchMatch;
    });

    if (!products?.length) return <p>No products found.</p>;

    return (
        <div>
            {/* Search and filter controls */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                {/* Category filter */}
                <div className="w-full md:w-auto">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Category
                    </label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        {categories.map(category => (
        <option key={category} value={category}>
            {category ? `${category.charAt(0).toUpperCase()}${category.slice(1)}` : 'Uncategorized'}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Keyword search */}
                <div className="flex-grow">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                        Search Products
                    </label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {/* Products grid */}
            {filteredProducts.length === 0 ? (
                <p>No products match your search criteria.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                       <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllProducts;