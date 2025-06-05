"use client"
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { logout } from '@/Redux/authSlice';
import { useRouter } from 'next/navigation';
import { Onest } from "next/font/google";
import { useDispatch } from 'react-redux';

const NavbarClient = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSeller, router } = useAppContext();
  const router1 = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      router1.push('/login');
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      dispatch(logout());
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 relative">
      {/* Logo */}
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />

      {/* Menu Desktop */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
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

        {isSeller && (
          <button 
            onClick={() => router.push('/seller')} 
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      {/* Icons Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="user icon" />
          Logout
        </button>
      </div>

      {/* Menu Mobile - Hamburger Icon */}
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu Mobile - Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 py-4 px-6">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="hover:text-gray-900 transition py-2 border-b"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/all-products" 
              className="hover:text-gray-900 transition py-2 border-b"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link 
              href="/ordersforclient" 
              className="hover:text-gray-900 transition py-2 border-b"
              onClick={() => setIsMenuOpen(false)}
            >
              MyOrders
            </Link>
            <Link 
              href="/" 
              className="hover:text-gray-900 transition py-2 border-b"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="flex items-center gap-4 pt-4">
              <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
              <button 
                onClick={() => {
                  router.push('/login');
                  handleLogout();
                  setIsMenuOpen(false);
                }} 
                className="flex items-center gap-2 hover:text-gray-900 transition"
              >
                <Image src={assets.user_icon} alt="user icon" />
                Logout
              </button>
            </div>

            {isSeller && (
              <button 
                onClick={() => {
                  router.push('/login');
                  handleLogout();
                  setIsMenuOpen(false);
                }} 
                className="text-xs border px-4 py-1.5 rounded-full mt-4 self-start"
              >
                logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarClient;