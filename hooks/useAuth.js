'use client';
import { useSelector } from 'react-redux';

export function useAuth() {
  const auth = useSelector(state => state.auth);
  
  return {
    ...auth,
    isCustomer: auth.user?.roles?.includes("customer"),
    isShopManager: auth.user?.roles?.includes("shop_manager")
  };
}