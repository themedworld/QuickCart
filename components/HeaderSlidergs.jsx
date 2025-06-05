'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { FiChevronRight } from "react-icons/fi";

const HeaderSlidergs = () => {
  const { products, currency, router } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [randomProducts, setRandomProducts] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      // Sélectionner 3 produits aléatoires
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 3));
    }
  }, [products]);

  useEffect(() => {
    if (randomProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % randomProducts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [randomProducts.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  if (!randomProducts || randomProducts.length === 0) {
    return null; // Ou un loader si vous préférez
  }

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {randomProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">
                {product.on_sale ? "Special Offer" : "New Arrival"}
              </p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                {product.name}
              </h1>
              <div className="flex items-center mt-4 md:mt-6">
                <button 
                  onClick={() => router.push(`/ProductforClient/${product.id}`)}
                  className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium hover:bg-orange-700 transition"
                >
                  Buy now
                </button>
                <button 
                  onClick={() => router.push('/all-products')}
                  className="group flex items-center gap-2 px-6 py-2.5 font-medium hover:text-orange-600 transition"
                >
                  Find more
                  <FiChevronRight className="group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              {product.images?.[0]?.src ? (
                <Image
                  className="md:w-72 w-48"
                  src={product.images[0].src}
                  alt={product.name}
                  width={300}
                  height={300}
                />
              ) : (
                <div className="md:w-72 w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  No image
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {randomProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              currentSlide === index ? "bg-orange-600 w-4" : "bg-gray-500/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeaderSlidergs;