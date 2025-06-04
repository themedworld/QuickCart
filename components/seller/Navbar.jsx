'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { logout } from '@/Redux/authSlice';
import ProtectedRoute from "@/components/ProtectedPage";
const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // Appel API pour logout côté serveur
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Dispatch l'action de logout
      dispatch(logout());
      router.push('/login');
      // Redirection vers la page de login
      router.push('/login');
    }
  };

  return (
   <ProtectedRoute allowedRoles={['shop_manager']}>
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b'>
      <Image 
        onClick={() => router.push('/')} 
        className='w-28 lg:w-32 cursor-pointer' 
        src={assets.logo} 
        alt="Logo" 
      />
      <button 
        onClick={handleLogout}
        className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
      >
        Logout
      </button>
    </div></ProtectedRoute>
  );
};

export default Navbar;