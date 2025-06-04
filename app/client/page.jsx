'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import  NavbarClient  from "@/components/NavbarClient";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedPage";
import Cart from "../cart/page";
import CartSummary from "@/components/CartSummary";
const Home = () => {
 
  return (
    <>
  <ProtectedRoute allowedRoles={['customer']}>
   
      < NavbarClient />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <HomeProducts />
       <CartSummary />

     
      </div>
   
    
    </ProtectedRoute>
    </>
  );
};

export default Home;