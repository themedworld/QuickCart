'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { initializeAuthState } from '@/Redux/authSlice';

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user, initialized } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(initializeAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (initialized) {
      if (isAuthenticated && user?.roles) {
        if (user.roles.includes('customer')) {
          router.push('/client');
        } else if (user.roles.includes('shop_manager')) {
          router.push('/seller');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, initialized, router]);

  return initialized ? children : null;
}