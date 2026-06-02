'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSection } from '@/components/dashboard-section';
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); 
    }
  }, [router]);
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Bienvenido</h1>
      <DashboardSection />
    </div>
  );
}