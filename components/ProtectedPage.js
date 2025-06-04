'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredRoles.length > 0 && 
                 !requiredRoles.some(role => user?.roles?.includes(role))) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, loading, user, requiredRoles, router]);

  if (loading || !isAuthenticated || 
      (requiredRoles.length > 0 && !requiredRoles.some(role => user?.roles?.includes(role)))) {
    return <div>Chargement...</div>;
  }

  return children;
}