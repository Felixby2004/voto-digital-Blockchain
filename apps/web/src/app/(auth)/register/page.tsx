'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login since self-registration is not supported (users are added via padron import)
    router.push('/login');
  }, [router]);

  return null;
}
