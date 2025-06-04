import React from "react";
import { useRouter } from "next/navigation";

const NewsLetter = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 pt-8 pb-14 px-4">
      <h1 className="md:text-4xl text-2xl font-medium">
        Sign in and shop the best products
      </h1>
      <p className="md:text-base text-gray-500/80 pb-8 max-w-2xl">
        Discover our selection of high-quality products at unbeatable prices.
        Enjoy an exceptional shopping experience.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        <button 
          onClick={() => router.push('/login')}
          className="px-8 py-3 h-14 text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
        >
          Sign In
        </button>
        
        <button 
          onClick={() => router.push('/register')}
          className="px-8 py-3 h-14 border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
        >
          Create Account
        </button>
      </div>
      
      <p className="text-sm text-gray-500 pt-4">
        Already a customer? <span 
          className="text-orange-600 cursor-pointer hover:underline"
          onClick={() => router.push('/login')}
        >
          Sign in here
        </span>
      </p>
    </div>
  );
};

export default NewsLetter;
