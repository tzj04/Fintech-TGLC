'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';

export default function Home() {
  const router = useRouter();
  const { userRole } = useNavigation();

  useEffect(() => {
    router.push(userRole === 'agent' ? '/agent-dashboard' : '/borrower-dashboard');
  }, [router, userRole]);

  return null;
}
