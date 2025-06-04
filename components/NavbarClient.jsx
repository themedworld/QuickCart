"use client"
import React from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { logout } from '@/Redux/authSlice';
import { useRouter } from 'next/navigation';
import { Onest } from "next/font/google";
import { useDispatch } from 'react-redux';
const NavbarClient = () => {

  const { isSeller, router } = useAppContext();
 const router1 = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {  router1.push('/login');
      // Appel API pour logout côté serveur
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Dispatch l'action de logout
      dispatch(logout());
    
 
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/ordersforclient" className="hover:text-gray-900 transition">
         MyOrders
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          Contact
        </Link>

        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}

      </div>

      <ul className="hidden md:flex items-center gap-4 ">
        <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
        <button  onClick={handleLogout} className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="user icon" />
          Logout
        </button>
      </ul>

      <div className="flex items-center md:hidden gap-3">
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}
        <button className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="user icon" />
          
          Account
        </button>
      </div>
    </nav>
  );
};

export default  NavbarClient ;