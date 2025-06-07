import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import Image from "next/image";
import { useRouter } from "next/navigation";
const FeaturedProduct = () => {
  const { products } = useAppContext();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
const router = useRouter();
  useEffect(() => {
    if (products.length > 0) {
      const sortedByRating = [...products].sort((a, b) => {
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        return ratingB - ratingA;
      });

      const topThree = sortedByRating.slice(0, 3);
      setFeaturedProducts(topThree);
      setLoading(false);
    }
  }, [products]);

  if (loading) return <Loading />;

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Produits Vedettes</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {featuredProducts.map((product) => (
          <div key={product.id} className="relative group">
            <Image
              src={product.images?.[0]?.src || "/images/placeholder-product.png"}
              alt={product.name}
              width={400}
              height={400}
              className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover aspect-square"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{product.name}</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4"
                    fill={i < Math.floor(product.average_rating) ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
                <span className="text-sm ml-1">
                  ({product.rating_count || 0} avis)
                </span>
              </div>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {product.short_description?.replace(/<[^>]*>/g, "") || "Découvrez ce produit exceptionnel"}
              </p>
              <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 bg-orange-600 px-4 py-2 rounded">
                Acheter maintenant 
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;