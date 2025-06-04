'use client'
import React from "react";
import HeaderSlidergs from "@/components/HeaderSlidergs";
import Homegs from "@/components/Homegs";
import Bannergs from "@/components/Bannergs";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedPage";
import Cart from "../cart/page";

const Getstarted = () => {
 
  return (
    <>

   
      <Navbar/>
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlidergs />
        <Homegs />
        <FeaturedProduct />
        <Bannergs />
        <NewsLetter />
     
      </div>
      <Footer />
    

    </>
  );
};

export default Getstarted;